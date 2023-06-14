import _ from 'lodash';
import convertToTsType from './convertToTsType';

type TypeProperty = {
  name: string;
  in: string;
  type: string;
  required: boolean;
  description: string;
};

export default function generateQueryParams(params: TypeProperty[], config: any) {
  if (params.length === 0) {
    return 'any';
  }
  let x: string = '{ \n';
  params.forEach((element) => {
    const { name, required, description } = element;
    x += `${name}${required ? '' : '?'}: ${convertToTsType(element, config)};  ${
      description ? `/* ${description} */` : ''
    }\n`;
  });
  x += `\n}`;
  return x;
}
