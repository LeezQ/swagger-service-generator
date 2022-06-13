import convertToTsType from './convertToTsType';

export default function generateQueryParams(
  params: {
    name: string;
    in: 'query' | 'body';
    description: string;
    required: boolean;
    type: 'string' | 'boolean';
  }[],
) {
  let typeRes = ['{'];
  params.forEach((item: any) => {
    const { name, description, required, type } = item;
    const paramRequired = required ? '' : '?';
    const paramDescription = description ? `/* ${description || ''} */` : '';
    typeRes.push(`
    ${paramDescription}
    ${name}${paramRequired}: ${convertToTsType(type)};
    `);
  });
  typeRes.push('}');
  return typeRes;
}
