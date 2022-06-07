const urlToCamelCase = (url: string) => {
  return url.replace(/[\/|\_|\?\=](\w)/g, function (all, letter) {
    return letter.toUpperCase();
  });
};

export default urlToCamelCase;
