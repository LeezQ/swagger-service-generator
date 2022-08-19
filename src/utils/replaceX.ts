const replaceX = ($ref?: string) => {
  if (!$ref) {
    return 'any';
  }
  $ref = $ref.replace(/\»/g, '');
  $ref = $ref.replace(/\[|\]/g, '');
  $ref = $ref.replace(/[\/|\«|\,|\»](.)/g, function (all, letter) {
    return letter.toUpperCase();
  });
  return $ref;
};
export default replaceX;
