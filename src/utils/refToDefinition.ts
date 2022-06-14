const refToDefinition = ($ref?: string) => {
  if (!$ref) {
    return 'any';
  }

  $ref = $ref.replace(/#\/definitions\//g, '');
  $ref = $ref.replace(/#\/components\/schemas\//g, '');

  return $ref;
};

export default refToDefinition;
