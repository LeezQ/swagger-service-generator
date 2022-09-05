"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const ejs_1 = tslib_1.__importDefault(require("ejs"));
const getSwaggerJson_1 = tslib_1.__importDefault(require("./utils/getSwaggerJson"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const _ = tslib_1.__importStar(require("lodash"));
const lodash_1 = require("lodash");
const urlToCamelCase_1 = tslib_1.__importDefault(require("./utils/urlToCamelCase"));
const child_process_1 = tslib_1.__importDefault(require("child_process"));
function goGenerate() {
    const config = require(path_1.default.join(process.cwd(), './.swagger.config.js'));
    if (Array.isArray(config)) {
        config.forEach((config) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield run(config);
        }));
    }
}
goGenerate();
//启动函数
function run(configItem) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        console.log(chalk_1.default.green(`读取json数据......`));
        let { swaggerPath, outDir = 'lib/', basePath = '/', request = `import request from 'umi-request';`, fileNameRule = (url) => {
            return (url.split('/') || [])[1] || 'index';
        }, functionNameRule = (url, operationId) => {
            if (operationId !== '') {
                return (0, urlToCamelCase_1.default)(operationId);
            }
            return (0, urlToCamelCase_1.default)(url.replace(/^\//, ''));
        }, whiteList, } = configItem;
        const res = yield (0, getSwaggerJson_1.default)(swaggerPath);
        const { paths, definitions } = res.data || {};
        basePath = typeof basePath !== 'undefined' ? basePath : (_a = res.data) === null || _a === void 0 ? void 0 : _a.basePath;
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
        console.log(chalk_1.default.green('开始生成 service...'));
        genetateService(pathGroups, fileNameRule, functionNameRule, request, basePath, outDir);
        console.log(chalk_1.default.green('done! service...'));
        console.log(chalk_1.default.green('开始生成 models...'));
        generateParamModel(pathGroups, outDir);
        console.log(chalk_1.default.green('done! '));
        console.log(chalk_1.default.green('开始生成 entity...'));
        generateEntity(definitions, outDir);
        console.log(chalk_1.default.green('done!'));
        console.log(chalk_1.default.green('format dart code...'));
        child_process_1.default.execSync(`dart format ${path_1.default.join(process.cwd(), 'lib')}`);
        console.log(chalk_1.default.green('done!'));
        console.log(chalk_1.default.green('pub run build_runner...'));
        setTimeout(() => {
            child_process_1.default.execSync(`flutter pub run build_runner build --delete-conflicting-outputs `);
            console.log(chalk_1.default.green('生成完成'));
        }, 1000);
    });
}
function replaceX(str) {
    if (!str) {
        return '';
    }
    str = str.replace('#/definitions/', '').replace('«', '').replace('»', '');
    return str;
}
function generateDartType(type) {
    switch (type) {
        case 'integer':
            return 'int';
        case 'number':
            return 'double';
        case 'string':
            return 'String';
        case 'boolean':
            return 'bool';
        case 'array':
            return 'List';
        case 'object':
            return 'Map';
        default:
            return 'dynamic';
    }
}
function generateParamProperty(property) {
    let { type, name, $ref = '', schema, description, required } = property;
    const _in = property.in || 'query';
    let originalRef = replaceX($ref);
    if (_in === 'body') {
        type = schema === null || schema === void 0 ? void 0 : schema.type;
    }
    if (schema === null || schema === void 0 ? void 0 : schema.$ref) {
        originalRef = replaceX(schema.$ref);
    }
    let res = ``;
    let requiredTxt = required ? '' : '?';
    if (!type) {
        res = `${originalRef}${requiredTxt} ${name};`;
    }
    else {
        if (originalRef !== '') {
            res = `${generateDartType(type)}<${originalRef}>${requiredTxt} ${name};`;
        }
        else {
            res = `${generateDartType(type)}${requiredTxt} ${name};`;
        }
    }
    return `
  /// ${description}
  /// ${required ? '必选' : '可选'}
  ${res}
  `;
}
function generateModelProperty(property, name, required = []) {
    let { type, $ref, schema = {}, description, items = {} } = property;
    const _in = property.in || 'query';
    let originalRef = replaceX($ref);
    if (_in === 'body') {
        type = schema.type;
    }
    let res = ``;
    let requiredFlag = name === 'success' || required.includes(name) ? true : false;
    let requiredTxt = requiredFlag ? '' : '?';
    if (!type) {
        res = `${originalRef}${requiredTxt} ${name};`;
    }
    else {
        // 如果是数组, 则需要添加泛型
        if (type === 'array') {
            const { type, $ref } = items;
            if (type) {
                originalRef = generateDartType(type);
            }
            else if ($ref) {
                originalRef = replaceX($ref);
            }
        }
        if (originalRef !== '') {
            res = `${generateDartType(type)}<${originalRef}>${requiredTxt} ${name};`;
        }
        else {
            res = `${generateDartType(type)}${requiredTxt} ${name};`;
        }
    }
    return `
  /// ${description}
  ${res}
  `;
}
function generateParamTypeName(upperOperationId) {
    const paramName = `Params${upperOperationId}`;
    return paramName;
}
function generateResponseTypeName(responses) {
    const $ref = _.get(responses, '200.schema.$ref');
    return replaceX($ref);
}
function genetateService(pathGroups, fileNameRule, functionNameRule, request, basePath, outDir) {
    const apiPath = path_1.default.join(process.cwd(), outDir + '/services/'); //存放api文件地址
    // remove apiPath
    if (fs_1.default.existsSync(apiPath)) {
        fs_1.default.rmSync(apiPath, { recursive: true });
    }
    if (!fs_1.default.existsSync(apiPath)) {
        fs_1.default.mkdirSync(apiPath, { recursive: true });
    }
    _.map(pathGroups, (pathGroup, groupKey) => {
        pathGroup = pathGroup.map((item) => {
            let { apiInfo, url } = item;
            const method = Object.keys(apiInfo)[0];
            let { operationId, summary, responses } = apiInfo[method];
            operationId = operationId.replace(/[\s|_]/g, '');
            let functionName = functionNameRule(url, operationId);
            let upperOperationId = (0, lodash_1.upperFirst)(operationId);
            let paramsType = generateParamTypeName(upperOperationId);
            let responseType = generateResponseTypeName(responses);
            return {
                url,
                summary,
                paramsType,
                responseType,
                method,
                functionName,
            };
        });
        // 生成 view
        ejs_1.default.renderFile(path_1.default.join(__dirname, '../templates/dart/services.ejs'), {
            pathGroup: pathGroup,
            request: request || '',
            basePath,
        }, {}, function (err, str) {
            if (err) {
                console.log(chalk_1.default.red(err.toString()));
            }
            fs_1.default.writeFileSync(path_1.default.join(apiPath, groupKey + '.dart'), str);
            console.log(chalk_1.default.green(`渲染成功：${groupKey + '.dart'}`));
        });
    });
}
function generateParamModel(pathGroups, outDir) {
    const modelDirPath = path_1.default.join(process.cwd(), outDir + '/models'); //存放api文件地址
    if (fs_1.default.existsSync(modelDirPath)) {
        fs_1.default.rmSync(modelDirPath, { recursive: true });
    }
    if (!fs_1.default.existsSync(modelDirPath)) {
        fs_1.default.mkdirSync(modelDirPath, { recursive: true });
    }
    const allParamName = [];
    _.map(pathGroups, (pathGroup) => {
        pathGroup.forEach((item) => {
            const { apiInfo } = item;
            let { operationId, parameters = [] } = apiInfo[Object.keys(apiInfo)[0]];
            operationId = operationId.replace(/[\s|_]/g, '');
            operationId = replaceX(operationId);
            const upperOperationId = (0, lodash_1.upperFirst)(operationId);
            const paramName = `Params${(0, lodash_1.upperFirst)(operationId)}`;
            if (!allParamName.includes(paramName)) {
                allParamName.push(paramName);
            }
            // 生成 model
            ejs_1.default.renderFile(path_1.default.join(__dirname, '../templates/dart/models.ejs'), {
                paramName: paramName,
                upperOperationId: upperOperationId,
                parameters: parameters,
                generateParamProperty,
            }, {}, function (err, str) {
                if (err) {
                    console.log(chalk_1.default.red(err.toString()));
                }
                fs_1.default.writeFileSync(path_1.default.join(modelDirPath, paramName + '.dart'), str);
                // successLog(path.join(genetatePathDir, `view.dart`));
            });
        });
    });
    // 生成 model index
    ejs_1.default.renderFile(path_1.default.join(__dirname, '../templates/dart/models_index.ejs'), {
        allParamName: allParamName,
    }, {}, function (err, str) {
        if (err) {
            console.log(chalk_1.default.red(err.toString()));
        }
        fs_1.default.writeFileSync(path_1.default.join(modelDirPath, `model.dart`), str);
        // successLog(path.join(genetatePathDir, `view.dart`));
    });
}
function generateEntity(definitions, outDir) {
    const entityDir = path_1.default.join(process.cwd(), outDir + '/entity'); //存放api文件地址
    if (fs_1.default.existsSync(entityDir)) {
        fs_1.default.rmSync(entityDir, { recursive: true });
    }
    if (!fs_1.default.existsSync(entityDir)) {
        // mkdir -p
        fs_1.default.mkdirSync(entityDir, { recursive: true });
    }
    let allModels = [];
    Object.keys(definitions).forEach((modelName) => {
        const { required = [], properties = {} } = definitions[modelName];
        allModels.push(replaceX(modelName));
        // 生成 entities
        ejs_1.default.renderFile(path_1.default.join(__dirname, '../templates/dart/entities.ejs'), {
            modelName: replaceX(modelName),
            required,
            properties,
            generateModelProperty,
        }, {}, function (err, str) {
            if (err) {
                console.log(chalk_1.default.red(err.toString()));
            }
            fs_1.default.writeFileSync(path_1.default.join(entityDir, `${replaceX(modelName)}.dart`), str);
        });
    });
    // 生成 entities
    ejs_1.default.renderFile(path_1.default.join(__dirname, '../templates/dart/entitie_index.ejs'), {
        allModels: allModels,
    }, {}, function (err, str) {
        if (err) {
            console.log(chalk_1.default.red(err.toString()));
        }
        fs_1.default.writeFileSync(path_1.default.join(entityDir, `entity.dart`), str);
    });
}
