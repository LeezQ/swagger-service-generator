"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
//获取swagger.json数据
function getSwaggerJson(url) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let res = {};
        if (url.startsWith('./')) {
            res.data = JSON.parse(fs_1.default.readFileSync(path_1.default.join(process.cwd(), url), 'utf-8'));
        }
        else {
            res = yield (0, axios_1.default)({ url: url, method: 'get' });
        }
        return res;
    });
}
exports.default = getSwaggerJson;
