"use strict";
// conver to ts type
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const refToDefinition_1 = tslib_1.__importDefault(require("./refToDefinition"));
const replaceX_1 = tslib_1.__importDefault(require("./replaceX"));
const convertToTsType = (item, config) => {
    const { definitionsName = 'Definitions' } = config;
    const { type, items, $ref } = item;
    if ($ref) {
        if ($ref.includes('integer')) {
            return 'number';
        }
        return `${definitionsName}.${(0, replaceX_1.default)((0, refToDefinition_1.default)($ref))}`;
    }
    switch (type) {
        case 'string':
            return 'string';
        case 'boolean':
            return 'boolean';
        case 'integer':
            return 'number';
        case 'number':
            return 'number';
        case 'array':
            if (items) {
                let itemsType = convertToTsType(items, config);
                return `${itemsType}[]`;
            }
            else {
                return 'any[]';
            }
        case 'object':
            return '{}';
        default:
            return 'any';
    }
};
exports.default = convertToTsType;
