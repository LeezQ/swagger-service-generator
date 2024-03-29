"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const convertToTsType_1 = tslib_1.__importDefault(require("./convertToTsType"));
const refToDefinition_1 = tslib_1.__importDefault(require("./refToDefinition"));
const replaceX_1 = tslib_1.__importDefault(require("./replaceX"));
function generateBodyParams(elements, config) {
    if (!elements)
        return 'any';
    let element;
    if (elements.length > 0) {
        element = elements[0];
    }
    else {
        element = elements;
    }
    if (lodash_1.default.get(element, 'schema.properties')) {
        let _type = '{';
        function getP(item) {
            // 递归
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
            ${propertyName}${required.includes(propertyName) ? '' : '?'}: ${(0, convertToTsType_1.default)(propertyValue, config)}; ${description ? `/* ${description} */` : ''}`;
                }
            });
        }
        getP(element.schema);
        _type += `\n}`;
        return _type;
    }
    else if (lodash_1.default.get(element, 'name')) {
        let _type = `{\n`;
        for (let i = 0; i < elements.length; i++) {
            let _e = elements[i];
            if (lodash_1.default.get(_e, 'schema.$ref')) {
                _type += `${_e.name}${_e.required ? '' : '?'}: ${getTypeFromRef(_e.schema.$ref, config)} /* ${_e.description} */ \n`;
            }
            else {
                _type += `${_e.name}${_e.required ? '' : '?'}: ${_e.schema.type} /* ${_e.description} */ \n`;
            }
        }
        _type += `}\n`;
        return _type;
    }
    else if (lodash_1.default.get(element, 'schema.$ref')) {
        return getTypeFromRef(element.schema.$ref, config);
    }
    return 'any';
}
exports.default = generateBodyParams;
function getTypeFromRef(ref, config) {
    const { definitionsName = 'Definitions' } = config;
    if (!ref) {
        return '';
    }
    if (ref.includes('integer')) {
        return 'number';
    }
    const bodyParamsSchemaRefType = (0, replaceX_1.default)((0, refToDefinition_1.default)(ref));
    return `${definitionsName}.${bodyParamsSchemaRefType}`;
}
