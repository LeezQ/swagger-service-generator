// conver to ts type

import refToDefinition from './refToDefinition';
import replaceX from './replaceX';

const convertToTsType: any = (item: any) => {
  const { type, items, $ref } = item;
  if ($ref) {
    return 'Definitions.' + replaceX(refToDefinition($ref));
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
        let itemsType = convertToTsType(items);
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
