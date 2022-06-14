"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const convertToTsType_1 = tslib_1.__importDefault(require("./convertToTsType"));
function generateBodyParams(params) {
    if (params.length === 0) {
        return 'any';
    }
    let x = '{ \n';
    params.forEach((element) => {
        const { name, required, description } = element;
        x += `${name}${required ? '' : '?'}: ${(0, convertToTsType_1.default)(element)};  ${description ? `/* ${description} */` : ''}\n`;
    });
    x += `\n}`;
    return x;
}
exports.default = generateBodyParams;
