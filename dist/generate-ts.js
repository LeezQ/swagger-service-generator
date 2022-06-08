"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const ejs_1 = tslib_1.__importDefault(require("ejs"));
const getSwaggerJson_1 = tslib_1.__importDefault(require("./utils/getSwaggerJson"));
const urlToCamelCase_1 = tslib_1.__importDefault(require("./utils/urlToCamelCase"));
//引入依赖
var fs = require('fs');
var path = require('path');
require('colors');
var _ = require('lodash');
const { default: dtsgenerator, parseSchema } = require('dtsgenerator');
const config = require(path.join(process.cwd(), './.swagger.config.js'));
if (Array.isArray(config)) {
    config.forEach((config) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        yield run(config);
    }));
}
//启动函数
function run(configItem) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let { swaggerPath, outDir, basePath, typingFileName = 'api.d.ts', request = `import request from 'umi-request';`, fileNameRule = function (url) {
            return url.split('/').pop();
        }, functionNameRule = function (url, operationId) {
            if (operationId !== '') {
                return (0, urlToCamelCase_1.default)(operationId);
            }
            return (0, urlToCamelCase_1.default)(url.replace(/^\//, ''));
        }, whiteList, } = configItem;
        const apiPath = path.join(process.cwd(), outDir); //存放api文件地址
        if (!fs.existsSync(apiPath)) {
            // mkdir -p
            fs.mkdirSync(apiPath, { recursive: true });
        }
        const res = yield (0, getSwaggerJson_1.default)(swaggerPath);
        const { paths } = res.data || {};
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
        _.map(pathGroups, (pathGroup, groupKey) => {
            ejs_1.default.renderFile(path.join(__dirname, '../templates/ts/function_service.ejs'), {
                request,
                basePath,
                typingFileName,
                pathGroup,
                urlToCamelCase: urlToCamelCase_1.default,
                upperCaseFirstLetter,
                functionNameRule: functionNameRule,
                _,
            }, {}, (err, data) => {
                if (err) {
                    console.log(chalk_1.default.red(`渲染失败：${err}`));
                }
                else {
                    fs.writeFileSync(path.join(apiPath, groupKey + '.ts'), data);
                    console.log(chalk_1.default.green(`渲染成功：${groupKey + '.ts'}`));
                }
            });
        });
        dtsgenerator({
            contents: [parseSchema(res.data)],
        })
            .then((generatedContent) => {
            fs.writeFile(path.join(apiPath, typingFileName), `/* eslint-disable */
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
function upperCaseFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
