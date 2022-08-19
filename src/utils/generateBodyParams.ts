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

export default function generateBodyParams(
  element: {
    name: string;
    in: string;
    schema: TypeSchema;
    descriptiosn: string;
  },
  config: any,
): string {
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

  const bodyParamsSchemaRefType = replaceX(refToDefinition(ref));
  return `${definitionsName}.${bodyParamsSchemaRefType}`;
}
