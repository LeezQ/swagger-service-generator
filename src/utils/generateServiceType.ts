import _ from 'lodash';
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

export default function generateServiceType(item: any, genType: string, functionName: string): string {
  const $ref = _.get(item, `schema.$ref`);
  if ($ref) {
    return getTypeFromRef($ref);
  } else {
    return `Paths.${_.upperFirst(functionName)}.${genType}`;
  }
}

function getTypeFromRef(ref?: string): string {
  if (!ref) {
    return '';
  }

  const bodyParamsSchemaRefType = replaceX(refToDefinition(ref));
  return 'Definitions.' + bodyParamsSchemaRefType;
}
