"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const ejs_1 = tslib_1.__importDefault(require("ejs"));
const getSwaggerJson_1 = tslib_1.__importDefault(require("./utils/getSwaggerJson"));
//引入依赖
var fs = require('fs');
var child_process = require('child_process');
var path = require('path');
require('colors');
var axios = require('axios');
var _ = require('lodash');
const config = require(path.join(process.cwd(), './swagger.config.json'));
//启动函数
function run() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        console.log(chalk_1.default.green(`读取json数据......`));
        const { url, outDir = './services/', modelDir = './models/', request = ``, filePathReg = '/(.*?)/', fileNameReg, } = config;
        const res = yield (0, getSwaggerJson_1.default)(url);
        const { paths, basePath = '', definitions } = res.data || {};
        let pathGroups = {};
        _.map(paths, (item, urlPath) => {
            const groupKeyMatch = urlPath.match(new RegExp(filePathReg));
            let groupKey = '';
            if (groupKeyMatch) {
                groupKey = groupKeyMatch[1] || 'default';
            }
            if (Object.keys(pathGroups).includes(groupKey)) {
                (pathGroups[groupKey] || []).push({
                    url: urlPath,
                    apiInfo: item,
                });
            }
            else {
                pathGroups[groupKey] = [
                    {
                        url: urlPath,
                        apiInfo: item,
                    },
                ];
            }
        });
        console.log(chalk_1.default.green('开始生成 service...'));
        genetateService(pathGroups, fileNameReg, request, basePath, outDir);
        console.log(chalk_1.default.green('done! service...'));
        console.log(chalk_1.default.green('开始生成 models...'));
        generateParamModel(pathGroups, modelDir);
        console.log(chalk_1.default.green('done! '));
        console.log(chalk_1.default.green('开始生成 entity...'));
        generateEntity(definitions);
        console.log(chalk_1.default.green('done!'));
        console.log(chalk_1.default.green('format dart code...'));
        child_process.execSync(`dart format ${path.join(process.cwd(), 'lib')}`);
        console.log(chalk_1.default.green('done!'));
        console.log(chalk_1.default.green('pub run build_runner...'));
        child_process.execSync(`flutter pub run build_runner build --delete-conflicting-outputs `);
        console.log(chalk_1.default.green('生成完成'));
    });
}
function upperCaseFirstLetter(str) {
    str = replaceX(str);
    return str.charAt(0).toUpperCase() + str.slice(1);
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
function generateModelProperty(property, name, required) {
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
    const res200 = responses['200'];
    const { schema = {}, description } = res200;
    const { $ref } = schema;
    return replaceX($ref);
}
function genetateService(pathGroups, fileNameReg, request, basePath, outDir) {
    const apiPath = path.join(process.cwd(), outDir); //存放api文件地址
    if (!fs.existsSync(apiPath)) {
        // mkdir -p
        fs.mkdirSync(apiPath, { recursive: true });
    }
    _.map(pathGroups, (pathGroup, groupKey) => {
        const fileName = (fileNameReg ? fileNameReg.replace(/\$1/g, groupKey) : groupKey) + '.dart';
        // 生成 view
        ejs_1.default.renderFile(path.join(__dirname, '../templates/dart/services.ejs'), {
            pathGroup: pathGroup,
            request: request || '',
            basePath,
            upperCaseFirstLetter,
            generateParamTypeName,
            generateResponseTypeName,
        }, {}, function (err, str) {
            if (err) {
                console.log(chalk_1.default.red(err.toString()));
            }
            fs.writeFileSync(path.join(apiPath, fileName), str);
            // successLog(path.join(genetatePathDir, `view.dart`));
        });
    });
}
function generateParamModel(pathGroups, modelDir) {
    const modelDirPath = path.join(process.cwd(), modelDir); //存放api文件地址
    if (!fs.existsSync(modelDirPath)) {
        fs.mkdirSync(modelDirPath, { recursive: true });
    }
    const allParamName = [];
    _.map(pathGroups, (pathGroup) => {
        pathGroup.forEach((item) => {
            const { apiInfo } = item;
            let { operationId, parameters = [] } = apiInfo[Object.keys(apiInfo)[0]];
            const upperOperationId = upperCaseFirstLetter(operationId);
            const paramName = `Params${upperCaseFirstLetter(operationId)}`;
            if (!allParamName.includes(paramName)) {
                allParamName.push(paramName);
            }
            // 生成 model
            ejs_1.default.renderFile(path.join(__dirname, '../templates/dart/models.ejs'), {
                paramName: paramName,
                upperOperationId: upperOperationId,
                parameters: parameters,
                generateParamProperty,
            }, {}, function (err, str) {
                if (err) {
                    console.log(chalk_1.default.red(err.toString()));
                }
                fs.writeFileSync(path.join(modelDirPath, paramName + '.dart'), str);
                // successLog(path.join(genetatePathDir, `view.dart`));
            });
        });
    });
    // 生成 model index
    ejs_1.default.renderFile(path.join(__dirname, '../templates/dart/models_index.ejs'), {
        allParamName: allParamName,
        replaceX: replaceX,
    }, {}, function (err, str) {
        if (err) {
            console.log(chalk_1.default.red(err.toString()));
        }
        fs.writeFileSync(path.join(modelDirPath, `model.dart`), str);
        // successLog(path.join(genetatePathDir, `view.dart`));
    });
}
function generateEntity(definitions, entityPath = 'lib/entity/') {
    const entityDir = path.join(process.cwd(), entityPath); //存放api文件地址
    if (!fs.existsSync(entityDir)) {
        // mkdir -p
        fs.mkdirSync(entityDir, { recursive: true });
    }
    Object.keys(definitions).forEach((modelName) => {
        const { type, required = [], properties = {}, title } = definitions[modelName];
        // 生成 entities
        ejs_1.default.renderFile(path.join(__dirname, '../templates/dart/entities.ejs'), {
            modelName,
            required,
            properties,
            replaceX: replaceX,
            upperCaseFirstLetter,
            generateModelProperty,
        }, {}, function (err, str) {
            if (err) {
                console.log(chalk_1.default.red(err.toString()));
            }
            fs.writeFileSync(path.join(entityDir, `${replaceX(modelName)}.dart`), str);
        });
    });
}
run();
