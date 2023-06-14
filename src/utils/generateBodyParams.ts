import _ from 'lodash';
import path from 'path';
import convertToTsType from './convertToTsType';
import refToDefinition from './refToDefinition';
import replaceX from './replaceX';

type TypeSchema = {
  type: string;
  required: string[];
  description: string;
  mock: string;
  name: string;
  $ref: string;
  properties: {
    [key: string]: TypeSchema;
  };
};

type TElement = {
  name: string;
  in: string;
  schema: TypeSchema;
  description: string;
};

export default function generateBodyParams(elements: any, config: any): string {
  if (!elements) return 'any';

  let element;

  if (elements.length > 0) {
    element = elements[0];
  } else {
    element = elements;
  }
  if (_.get(element, 'schema.properties')) {
    let _type = '{';
    function getP(item: TypeSchema) {
      // 递归
      const { required = [] } = item;
      _.map(item.properties, (propertyValue, propertyName: string) => {
        const { type, description } = propertyValue;
        if (type === 'object') {
          _type += `
              ${description ? `/* ${description} */` : ''}
            ${propertyName}${required ? '' : '?'}: {
              `;
          getP(propertyValue);
          _type += '}\n';
        } else {
          _type += `
            ${propertyName}${required.includes(propertyName) ? '' : '?'}: ${convertToTsType(propertyValue, config)}; ${
            description ? `/* ${description} */` : ''
          }`;
        }
      });
    }
    getP(element.schema);
    _type += `\n}`;
    return _type;
  } else if (_.get(element, 'name')) {
    let _type = `{\n`;
    for (let i = 0; i < elements.length; i++) {
      let _e = elements[i];
      if (_.get(_e, 'schema.$ref')) {
        _type += `${_e.name}${_e.required ? '' : '?'}: ${getTypeFromRef(_e.schema.$ref, config)} /* ${
          _e.description
        } */ \n`;
      } else {
        _type += `${_e.name}${_e.required ? '' : '?'}: ${_e.schema.type} /* ${_e.description} */ \n`;
      }
    }
    _type += `}\n`;
    return _type;
  } else if (_.get(element, 'schema.$ref')) {
    return getTypeFromRef(element.schema.$ref, config);
  }
  return 'any';
}

function getTypeFromRef(ref?: string, config?: any): string {
  const { definitionsName = 'Definitions' } = config;

  if (!ref) {
    return '';
  }

  if (ref.includes('integer')) {
    return 'number';
  }

  const bodyParamsSchemaRefType = replaceX(refToDefinition(ref));
  return `${definitionsName}.${bodyParamsSchemaRefType}`;
}
