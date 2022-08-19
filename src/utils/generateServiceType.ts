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

export default function generateServiceType(item: any, genType: string, functionName: string, config: any): string {
  const $ref = _.get(item, `schema.$ref`);
  if ($ref) {
    return getTypeFromRef($ref, config);
  } else {
    return `Paths.${_.upperFirst(functionName)}.${genType}`;
  }
}

function getTypeFromRef(ref?: string, config?: any): string {
  const { definitionsName = 'Definitions' } = config;
  if (!ref) {
    return '';
  }

  const bodyParamsSchemaRefType = replaceX(refToDefinition(ref));
  return `${definitionsName}.${bodyParamsSchemaRefType}`;
}
