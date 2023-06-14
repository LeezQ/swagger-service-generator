"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const convertToTsType_1 = tslib_1.__importDefault(require("./convertToTsType"));
function generateQueryParams(params, config) {
    if (params.length === 0) {
        return 'any';
    }
    let x = '{ \n';
    params.forEach((element) => {
        const { name, required, description } = element;
        x += `${name}${required ? '' : '?'}: ${(0, convertToTsType_1.default)(element, config)};  ${description ? `/* ${description} */` : ''}\n`;
    });
    x += `\n}`;
    return x;
}
exports.default = generateQueryParams;
