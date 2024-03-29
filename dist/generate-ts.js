'use strict';

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const ejs_1 = tslib_1.__importDefault(require("ejs"));
const getSwaggerJson_1 = tslib_1.__importDefault(require("./utils/getSwaggerJson"));
const urlToCamelCase_1 = tslib_1.__importDefault(require("./utils/urlToCamelCase"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const _ = tslib_1.__importStar(require("lodash"));
const generateBodyParams_1 = tslib_1.__importDefault(require("./utils/generateBodyParams"));
const generateProperties_1 = tslib_1.__importDefault(require("./utils/generateProperties"));
const refToDefinition_1 = tslib_1.__importDefault(require("./utils/refToDefinition"));
const replaceX_1 = tslib_1.__importDefault(require("./utils/replaceX"));
const generateQueryParams_1 = tslib_1.__importDefault(require("./utils/generateQueryParams"));
const generateServiceType_1 = tslib_1.__importDefault(require("./utils/generateServiceType"));
function goGenerate() {
    const config = require(path_1.default.join(process.cwd(), './.swagger.config.js'));
    if (Array.isArray(config)) {
        config.forEach((config) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield run(config);
        }));
    }
}
goGenerate();
function run(configItem) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const res = yield (0, getSwaggerJson_1.default)(configItem.swaggerPath);
        configItem = Object.assign({ outDir: 'src/services', basePath: '/', typingFileName: 'api.d.ts', definitionsName: 'Definitions', pathsName: 'Paths', request: `import request from 'umi-request';`, fileNameRule: (url) => {
                return (url.split('/') || [])[1] || 'index';
            }, functionNameRule: (url, operationId) => {
                if (operationId && operationId !== '') {
                    return (0, urlToCamelCase_1.default)(operationId);
                }
                return (0, urlToCamelCase_1.default)(url.replace(/^\//, ''));
            } }, configItem);
        generateTsServices(configItem, res);
        generateTsTypes(configItem, res);
    });
}
function generateTsTypes(configItem, res) {
    const { outDir, typingFileName, functionNameRule, whiteList } = configItem;
    let { paths, definitions = {}, components = { schemas: {} }, openapi, swagger } = res.data || {};
    if (_.isEmpty(definitions)) {
        definitions = components.schemas;
    }
    const typeFilePath = path_1.default.join(process.cwd(), outDir); //存放api文件地址
    if (!fs_1.default.existsSync(typeFilePath)) {
        // mkdir -p
        fs_1.default.mkdirSync(typeFilePath, { recursive: true });
    }
    let _definitionsData = {};
    let pathsData = {};
    _.map(paths, (item, urlPath) => {
        if (_.isFunction(whiteList) && !whiteList(urlPath)) {
            return;
        }
        if (_.isArray(whiteList) && !whiteList.includes(urlPath)) {
            return;
        }
        Object.keys(item).forEach((method) => {
            let bodyParamsType = 'any';
            let queryParamsType = 'any';
            let responsesType = 'any';
            let functionName = functionNameRule(urlPath, _.get(item, `${method}.operationId`));
            if (swagger) {
                const parameters = _.get(item, `${method}.parameters`, []);
                // query params
                const queryParams = parameters.filter((item) => item.in === 'query');
                queryParamsType = (0, generateQueryParams_1.default)(queryParams, configItem);
                // body params
                const bodyParams = parameters.filter((item) => item.in === 'body');
                bodyParamsType = (0, generateBodyParams_1.default)(bodyParams, configItem);
                addDefinitionData(_.get(bodyParams, '[0].schema.$ref'), _definitionsData, definitions);
                // responses params
                let response = `${method}.responses.200`;
                responsesType = (0, generateBodyParams_1.default)(_.get(item, `${response}`), configItem);
                addDefinitionData(_.get(item, `${method}.responses.200.schema.$ref`), _definitionsData, definitions);
            }
            else if (openapi) {
                let request = `${method}.requestBody.content.application/json`;
                bodyParamsType = (0, generateBodyParams_1.default)(_.get(item, `${request}`), configItem);
                addDefinitionData(_.get(item, `${request}.schema.$ref`), _definitionsData, definitions);
                // let response = `${method}.responses.200.content.*/*.schema.schema.$ref`;
                let response = `${method}.responses.default.content.application/json.schema.allOf[1].properties.data.$ref`;
                addDefinitionData(_.get(item, `${response}`), _definitionsData, definitions);
            }
            pathsData[functionName] = {
                nameSpace: _.upperFirst(functionName),
                queryParamsType,
                bodyParamsType,
                responsesType,
            };
        });
    });
    function parseDefinition(properties, _defi) {
        if (!properties) ;
        else {
            _.map(properties, (item) => {
                if (item.$ref) {
                    _defi[item.$ref] = definitions[(0, refToDefinition_1.default)(item.$ref)];
                    parseDefinition(definitions[(0, refToDefinition_1.default)(item.$ref)].properties, _defi);
                }
                else if (item.type === 'array' && !_defi[item.items.$ref]) {
                    if (item.items.$ref) {
                        _defi[item.items.$ref] = definitions[(0, refToDefinition_1.default)(item.items.$ref)];
                        parseDefinition(definitions[(0, refToDefinition_1.default)(item.items.$ref)].properties, _defi);
                    }
                }
            });
        }
        return _defi;
    }
    _.map(_definitionsData, (item, key) => {
        // 递归
        if (item) {
            parseDefinition(item.properties, _definitionsData);
            // console.log(parseDefinition(item.properties, _definitionsData));
        }
    });
    let definitionsData = {};
    _.map(_definitionsData, (item, key) => {
        // generate
        if (item) {
            definitionsData[(0, replaceX_1.default)((0, refToDefinition_1.default)(key))] = (0, generateProperties_1.default)(item, configItem);
        }
    });
    ejs_1.default.renderFile(path_1.default.join(__dirname, '../templates/ts/definition.ejs'), {
        configItem,
        pathsData,
        definitionsData,
    }, {}, (err, data) => {
        if (err) {
            console.log(chalk_1.default.red(`渲染失败：${err}`));
        }
        else {
            fs_1.default.writeFileSync(path_1.default.join(typeFilePath, typingFileName), data);
            console.log(chalk_1.default.green(`渲染成功：${typingFileName}`));
        }
    });
}
function generateTsServices(configItem, res) {
    var _a;
    let { outDir, basePath, typingFileName, request, fileNameRule, functionNameRule, whiteList } = configItem;
    const apiPath = path_1.default.join(process.cwd(), outDir); //存放api文件地址
    if (!fs_1.default.existsSync(apiPath)) {
        // mkdir -p
        fs_1.default.mkdirSync(apiPath, { recursive: true });
    }
    const { paths, openapi, swagger } = res.data || {};
    basePath = typeof basePath !== 'undefined' ? basePath : (_a = res.data) === null || _a === void 0 ? void 0 : _a.basePath;
    let pathGroups = {};
    _.map(paths, (item, urlPath) => {
        if (_.isFunction(whiteList) && !whiteList(urlPath)) {
            return;
        }
        if (_.isArray(whiteList) && !whiteList.includes(urlPath)) {
            return;
        }
        let fileName = fileNameRule(urlPath);
        if (Object.keys(pathGroups).includes(fileName)) {
            pathGroups[fileName].push({
                url: urlPath,
                apiInfo: item,
            });
        }
        else {
            pathGroups[fileName] = [
                {
                    url: urlPath,
                    apiInfo: item,
                },
            ];
        }
    });
    _.map(pathGroups, (pathGroup, groupKey) => {
        let _pathGroup = [];
        for (const pathItem of pathGroup) {
            let { apiInfo, url } = pathItem;
            // const method = Object.keys(apiInfo)[0];
            const methods = Object.keys(apiInfo);
            methods.forEach((method) => {
                // console.log(111, method);
                let { summary = '', operationId = '', consumes = '' } = apiInfo[method];
                let functionName = functionNameRule(url, operationId);
                let bodyParamsType = `any`;
                let responsesType = `any`;
                let item = pathItem.apiInfo;
                if (swagger) {
                    const parameters = _.get(item, `${method}.parameters`, []);
                    const queryParams = parameters.filter((item) => item.in === 'query');
                    // body params
                    const bodyParams = parameters.filter((item) => item.in === 'body');
                    if (queryParams.length > 0) {
                        bodyParamsType = (0, generateServiceType_1.default)(_.get(queryParams[0], `schema.$ref`), 'QueryParameters', functionName, configItem);
                    }
                    if (bodyParams.length > 0) {
                        if (bodyParamsType === 'any' || method === 'post') {
                            bodyParamsType = '';
                        }
                        else {
                            bodyParamsType += '&';
                        }
                        bodyParamsType += (0, generateServiceType_1.default)(_.get(bodyParams[0], `schema.$ref`), 'BodyParameters', functionName, configItem);
                    }
                    // responses params
                    let response = `${method}.responses.200`;
                    responsesType = (0, generateServiceType_1.default)(_.get(item, `${response}.schema.$ref`), 'Responses', functionName, configItem);
                }
                else if (openapi) {
                    let request = `${method}.requestBody.content.application/json`;
                    bodyParamsType = (0, generateServiceType_1.default)(_.get(item, `${request}.schema.$ref`), 'BodyParameters', functionName, configItem);
                    // let response = `${method}.responses.200.content.*/*.schema.$ref`;
                    let response = `${method}.responses.default.content.application/json.schema.allOf[1].properties.data.$ref`;
                    responsesType = (0, generateServiceType_1.default)(_.get(item, `${response}`), 'Responses', functionName, configItem);
                }
                _pathGroup.push({
                    url,
                    summary,
                    bodyParamsType,
                    responsesType,
                    consumes,
                    method,
                    functionName,
                });
            });
        }
        ejs_1.default.renderFile(path_1.default.join(__dirname, '../templates/ts/function_service.ejs'), {
            request,
            basePath,
            typingFileName,
            pathGroup: _pathGroup,
            functionNameRule: functionNameRule,
            functionName: '',
        }, {}, (err, data) => {
            if (err) {
                console.log(chalk_1.default.red(`渲染失败：${err}`));
            }
            else {
                fs_1.default.writeFileSync(path_1.default.join(apiPath, groupKey + '.ts'), data);
                console.log(chalk_1.default.green(`渲染成功：${groupKey + '.ts'}`));
            }
        });
    });
}
function addDefinitionData(ref, _definitionsData, definitions) {
    if (ref) {
        _definitionsData[ref] = definitions[(0, refToDefinition_1.default)(ref)];
    }
}
