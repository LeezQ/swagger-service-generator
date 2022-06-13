const refToDefinition = ($ref?: string) => {
  if (!$ref) {
    return 'any';
  }

  $ref = $ref.replace(/#\/definitions\//g, '');

  return $ref;
};

export default refToDefinition;
