import _ from 'lodash';
import convertToTsType from './convertToTsType';

export default function generateProperties(item: {
  type: 'string';
  properties: {
    [key: string]: {
      type: 'string';
      description: string;
      required: boolean;
      $ref: string;
    };
  };
}) {
  const { properties } = item;

  let typeRes = ['{\n'];
  _.map(properties, (item: any, propertyName: string) => {
    const { description, required } = item;
    let paramType = convertToTsType(item);
    const paramRequired = required ? '' : '?';

    typeRes.push(`${propertyName}${paramRequired}: ${paramType}; ${description ? `/* ${description} */\n` : ''}`);
  });
  typeRes.push('}');

  return typeRes.join('');
}
