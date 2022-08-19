// conver to ts type

import path from 'path';
import refToDefinition from './refToDefinition';
import replaceX from './replaceX';

const convertToTsType: any = (item: any, config: any) => {
  const { definitionsName = 'Definitions' } = config;

  const { type, items, $ref } = item;
  if ($ref) {
    return `${definitionsName}.${replaceX(refToDefinition($ref))}`;
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
      } else {
        return 'any[]';
      }

    case 'object':
      return '{}';
    default:
      return 'any';
  }
};

export default convertToTsType;
