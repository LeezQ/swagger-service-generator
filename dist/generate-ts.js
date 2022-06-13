"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const ejs_1 = tslib_1.__importDefault(require("ejs"));
const getSwaggerJson_1 = tslib_1.__importDefault(require("./utils/getSwaggerJson"));
const urlToCamelCase_1 = tslib_1.__importDefault(require("./utils/urlToCamelCase"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const _ = tslib_1.__importStar(require("lodash"));
const refToType_1 = tslib_1.__importDefault(require("./utils/refToType"));
const lodash_1 = require("lodash");
const { default: dtsgenerator, parseSchema } = require('dtsgenerator');
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
    var _a, _b, _c, _d, _e;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let { swaggerPath, outDir = 'src/services', basePath = '/', typingFileName = 'api.d.ts', request = `import request from 'umi-request';`, fileNameRule = (url) => {
            return (url.split('/') || [])[1] || 'index';
        }, functionNameRule = (url, operationId) => {
            if (operationId !== '') {
                return (0, urlToCamelCase_1.default)(operationId);
            }
            return (0, urlToCamelCase_1.default)(url.replace(/^\//, ''));
        }, parseType = (apiInfo, method, functionName, apiDocType) => {
            let paramsType = 'any';
            let responseType = 'any';
            let parameters = _.get(apiInfo, `${method}.parameters`);
            let paramsTypeSchema = _.get(apiInfo, `${method}.parameters[0].schema`);
            let responsesTypeSchema = _.get(apiInfo, `${method}.responses.200.schema`);
            if (apiDocType.type === 'openapi') {
                paramsTypeSchema = _.get(apiInfo, `${method}.requestBody.content.application/json.schema`);
                responsesTypeSchema = _.get(apiInfo, `${method}.responses.200.content.*/*.schema`);
            }
            if (paramsTypeSchema) {
                paramsType = (0, refToType_1.default)(paramsTypeSchema);
            }
            else {
                let operationId = _.get(apiInfo, `${method}.operationId`);
                if (!operationId) {
                    operationId = `${_.upperFirst(functionName)}${_.upperFirst(method)}`;
                }
                if (_.find(parameters, { in: 'query' })) {
                    paramsType = `Paths.${(0, lodash_1.upperFirst)(operationId)}.QueryParameters`;
                }
                else if (_.find(parameters, { in: 'body' }) || _.find(parameters, { in: 'path' })) {
                    const name = _.find(parameters, { in: 'body' }).name;
                    paramsType = `Paths.${(0, lodash_1.upperFirst)(operationId)}.Parameters.${(0, lodash_1.upperFirst)(name)},
          )}`;
                }
                else {
                    paramsType = `{}`;
                }
            }
            if (responsesTypeSchema) {
                responseType = (0, refToType_1.default)(responsesTypeSchema);
            }
            return {
                paramsType,
                responseType,
            };
        }, whiteList, } = configItem;
        const apiPath = path_1.default.join(process.cwd(), outDir); //存放api文件地址
        if (!fs_1.default.existsSync(apiPath)) {
            // mkdir -p
            fs_1.default.mkdirSync(apiPath, { recursive: true });
        }
        const res = yield (0, getSwaggerJson_1.default)(swaggerPath);
        const { paths } = res.data || {};
        let apiDocType;
        if ((_a = res.data) === null || _a === void 0 ? void 0 : _a.swagger) {
            apiDocType = {
                type: 'swagger',
                version: (_b = res.data) === null || _b === void 0 ? void 0 : _b.swagger,
            };
        }
        else if ((_c = res.data) === null || _c === void 0 ? void 0 : _c.openapi) {
            apiDocType = {
                type: 'openapi',
                version: (_d = res.data) === null || _d === void 0 ? void 0 : _d.openapi,
            };
        }
        basePath = typeof basePath !== 'undefined' ? basePath : (_e = res.data) === null || _e === void 0 ? void 0 : _e.basePath;
        let pathGroups = {};
        _.map(paths, (item, urlPath) => {
            if (whiteList && !whiteList.includes(urlPath)) {
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
            pathGroup = pathGroup.map((item) => {
                let { apiInfo, url } = item;
                const method = Object.keys(apiInfo)[0];
                let { summary = '', operationId = '', consumes = '' } = apiInfo[method];
                let functionName = functionNameRule(url, operationId);
                let { paramsType, responseType } = parseType(apiInfo, method, functionName, apiDocType);
                return {
                    url,
                    summary,
                    paramsType,
                    responseType,
                    consumes,
                    method,
                    functionName,
                };
            });
            ejs_1.default.renderFile(path_1.default.join(__dirname, '../templates/ts/function_service.ejs'), {
                request,
                basePath,
                typingFileName,
                pathGroup,
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
        dtsgenerator({
            contents: [parseSchema(res.data)],
        })
            .then((generatedContent) => {
            fs_1.default.writeFile(path_1.default.join(apiPath, typingFileName), `/* eslint-disable */
      ${generatedContent}`, { flag: 'w' }, (err) => {
                if (err) {
                    return console.log(err);
                }
            });
        })
            .catch((err) => {
            console.log(err);
        });
    });
}
