import { upperFirst } from 'lodash';

const refToType = (schema: { type?: string; $ref?: string }) => {
  let { type = 'any', $ref } = schema || {};
  if (!$ref) {
    return type;
  }

  $ref = $ref.replace(/#\/|»/g, '');

  $ref = $ref.replace(/[\/|\«|\,](.)/g, function (all, letter) {
    if (all.startsWith('«') || all.startsWith('»') || all.startsWith(',')) {
      return letter.toUpperCase();
    }
    return '.' + letter.toUpperCase();
  });

  return upperFirst($ref);
};

export default refToType;
