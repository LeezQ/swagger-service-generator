"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const convertToTsType_1 = tslib_1.__importDefault(require("./convertToTsType"));
const refToDefinition_1 = tslib_1.__importDefault(require("./refToDefinition"));
const replaceX_1 = tslib_1.__importDefault(require("./replaceX"));
function generateBodyParams(element) {
    if (lodash_1.default.get(element, 'schema.properties')) {
        let _type = '{';
        function getP(item) {
            // 递归
            console.log(item);
            const { required = [] } = item;
            lodash_1.default.map(item.properties, (propertyValue, propertyName) => {
                const { type, description } = propertyValue;
                if (type === 'object') {
                    _type += `
              ${description ? `/* ${description} */` : ''}
            ${propertyName}${required ? '' : '?'}: {
              `;
                    getP(propertyValue);
                    _type += '}\n';
                }
                else {
                    _type += `
            ${propertyName}${required.includes(propertyName) ? '' : '?'}: ${(0, convertToTsType_1.default)(propertyValue)}; ${description ? `/* ${description} */` : ''}`;
                }
            });
        }
        getP(element.schema);
        _type += `\n}`;
        return _type;
    }
    else if (lodash_1.default.get(element, 'schema.$ref')) {
        return getTypeFromRef(element.schema.$ref);
    }
    return 'any';
}
exports.default = generateBodyParams;
function getTypeFromRef(ref) {
    if (!ref) {
        return '';
    }
    const bodyParamsSchemaRefType = (0, replaceX_1.default)((0, refToDefinition_1.default)(ref));
    return 'Definitions.' + bodyParamsSchemaRefType;
}
