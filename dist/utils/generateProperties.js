"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const convertToTsType_1 = tslib_1.__importDefault(require("./convertToTsType"));
function generateProperties(item, config) {
    const { properties } = item;
    let typeRes = ['{\n'];
    lodash_1.default.map(properties, (item, propertyName) => {
        const { description, required } = item;
        let paramType = (0, convertToTsType_1.default)(item, config);
        const paramRequired = required ? '' : '?';
        typeRes.push(`${propertyName}${paramRequired}: ${paramType}; ${description ? `/* ${description} */\n` : ''}`);
    });
    typeRes.push('}');
    return typeRes.join('');
}
exports.default = generateProperties;
