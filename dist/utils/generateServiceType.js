"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const refToDefinition_1 = tslib_1.__importDefault(require("./refToDefinition"));
const replaceX_1 = tslib_1.__importDefault(require("./replaceX"));
function generateServiceType(item, genType, functionName) {
    const $ref = lodash_1.default.get(item, `schema.$ref`);
    if ($ref) {
        return getTypeFromRef($ref);
    }
    else {
        return `Paths.${lodash_1.default.upperFirst(functionName)}.${genType}`;
    }
}
exports.default = generateServiceType;
function getTypeFromRef(ref) {
    if (!ref) {
        return '';
    }
    const bodyParamsSchemaRefType = (0, replaceX_1.default)((0, refToDefinition_1.default)(ref));
    return 'Definitions.' + bodyParamsSchemaRefType;
}
