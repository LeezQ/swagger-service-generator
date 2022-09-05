import chalk from 'chalk';
import ejs from 'ejs';
import getSwaggerJson from './utils/getSwaggerJson';
import fs from 'fs';
import path from 'path';
import * as _ from 'lodash';
import { upperFirst } from 'lodash';
import urlToCamelCase from './utils/urlToCamelCase';
import child_process from 'child_process';

function goGenerate() {
  const config = require(path.join(process.cwd(), './.swagger.config.js'));

  if (Array.isArray(config)) {
    config.forEach(async (config) => {
      await run(config);
    });
  }
}

goGenerate();

//启动函数
async function run(configItem: any) {
  console.log(chalk.green(`读取json数据......`));
  let {
    swaggerPath,
    outDir = 'lib/',
    basePath = '/',
    request = `import request from 'umi-request';`,
    fileNameRule = (url: string) => {
      return (url.split('/') || [])[1] || 'index';
    },
    functionNameRule = (url: string, operationId: string) => {
      if (operationId !== '') {
        return urlToCamelCase(operationId);
      }
      return urlToCamelCase(url.replace(/^\//, ''));
    },
    whiteList,
  } = configItem;

  const res = await getSwaggerJson(swaggerPath);
  const { paths, definitions } = res.data || {};

  basePath = typeof basePath !== 'undefined' ? basePath : res.data?.basePath;

  let pathGroups: {
    [key: string]: {
      url: string;
      apiInfo: any;
    }[];
  } = {};
  _.map(paths, (item: any, urlPath: string) => {
    if (whiteList && !whiteList.includes(urlPath)) {
      return;
    }
    let fileName = fileNameRule(urlPath);

    if (Object.keys(pathGroups).includes(fileName)) {
      pathGroups[fileName].push({
        url: urlPath,
        apiInfo: item,
      });
    } else {
      pathGroups[fileName] = [
        {
          url: urlPath,
          apiInfo: item,
        },
      ];
    }
  });

  console.log(chalk.green('开始生成 service...'));
  genetateService(pathGroups, fileNameRule, functionNameRule, request, basePath, outDir);
  console.log(chalk.green('done! service...'));

  console.log(chalk.green('开始生成 models...'));
  generateParamModel(pathGroups, outDir);
  console.log(chalk.green('done! '));

  console.log(chalk.green('开始生成 entity...'));
  generateEntity(definitions, outDir);
  console.log(chalk.green('done!'));

  console.log(chalk.green('format dart code...'));
  child_process.execSync(`dart format ${path.join(process.cwd(), 'lib')}`);
  console.log(chalk.green('done!'));

  console.log(chalk.green('pub run build_runner...'));
  setTimeout(() => {
    child_process.execSync(`flutter pub run build_runner build --delete-conflicting-outputs `);
    console.log(chalk.green('生成完成'));
  }, 1000);
}

function replaceX(str: string) {
  if (!str) {
    return '';
  }
  str = str.replace('#/definitions/', '').replace('«', '').replace('»', '');
  return str;
}

function generateDartType(type: string) {
  switch (type) {
    case 'integer':
      return 'int';
    case 'number':
      return 'double';
    case 'string':
      return 'String';
    case 'boolean':
      return 'bool';
    case 'array':
      return 'List';
    case 'object':
      return 'Map';
    default:
      return 'dynamic';
  }
}

function generateParamProperty(property: {
  in?: any;
  type?: any;
  name?: any;
  $ref?: any;
  schema?: {
    type: string;
    $ref: string;
  };
  description?: any;
  required?: any;
}) {
  let { type, name, $ref = '', schema, description, required } = property;
  const _in = property.in || 'query';
  let originalRef = replaceX($ref);
  if (_in === 'body') {
    type = schema?.type;
  }

  if (schema?.$ref) {
    originalRef = replaceX(schema.$ref);
  }

  let res = ``;
  let requiredTxt = required ? '' : '?';
  if (!type) {
    res = `${originalRef}${requiredTxt} ${name};`;
  } else {
    if (originalRef !== '') {
      res = `${generateDartType(type)}<${originalRef}>${requiredTxt} ${name};`;
    } else {
      res = `${generateDartType(type)}${requiredTxt} ${name};`;
    }
  }
  return `
  /// ${description}
  /// ${required ? '必选' : '可选'}
  ${res}
  `;
}

function generateModelProperty(
  property: { in?: any; type?: any; $ref?: any; schema?: any; description?: any; items?: any },
  name: string,
  required: string | any[] = [],
) {
  let { type, $ref, schema = {}, description, items = {} } = property;
  const _in = property.in || 'query';
  let originalRef = replaceX($ref);

  if (_in === 'body') {
    type = schema.type;
  }

  let res = ``;
  let requiredFlag = name === 'success' || required.includes(name) ? true : false;
  let requiredTxt = requiredFlag ? '' : '?';

  if (!type) {
    res = `${originalRef}${requiredTxt} ${name};`;
  } else {
    // 如果是数组, 则需要添加泛型
    if (type === 'array') {
      const { type, $ref } = items;
      if (type) {
        originalRef = generateDartType(type);
      } else if ($ref) {
        originalRef = replaceX($ref);
      }
    }

    if (originalRef !== '') {
      res = `${generateDartType(type)}<${originalRef}>${requiredTxt} ${name};`;
    } else {
      res = `${generateDartType(type)}${requiredTxt} ${name};`;
    }
  }
  return `
  /// ${description}
  ${res}
  `;
}

function generateParamTypeName(upperOperationId: string) {
  const paramName = `Params${upperOperationId}`;
  return paramName;
}

function generateResponseTypeName(responses: { [x: string]: any }) {
  const $ref = _.get(responses, '200.schema.$ref');
  return replaceX($ref);
}

function genetateService(
  pathGroups: { [key: string]: { url: string; apiInfo: any }[] },
  fileNameRule: (url: string) => string,
  functionNameRule: (url: string, operationId: string) => string,
  request: any,
  basePath: string,
  outDir: any,
) {
  const apiPath = path.join(process.cwd(), outDir + '/services/'); //存放api文件地址
  // remove apiPath
  if (fs.existsSync(apiPath)) {
    fs.rmSync(apiPath, { recursive: true });
  }
  if (!fs.existsSync(apiPath)) {
    fs.mkdirSync(apiPath, { recursive: true });
  }
  _.map(pathGroups, (pathGroup: any[], groupKey: string) => {
    pathGroup = pathGroup.map((item: any) => {
      let { apiInfo, url } = item;
      const method = Object.keys(apiInfo)[0];
      let { operationId, summary, responses } = apiInfo[method];

      operationId = operationId.replace(/[\s|_]/g, '');

      let functionName = functionNameRule(url, operationId);

      let upperOperationId = upperFirst(operationId);

      let paramsType = generateParamTypeName(upperOperationId);
      let responseType = generateResponseTypeName(responses);

      return {
        url,
        summary,
        paramsType,
        responseType,
        method,
        functionName,
      };
    });

    // 生成 view
    ejs.renderFile(
      path.join(__dirname, '../templates/dart/services.ejs'),
      {
        pathGroup: pathGroup,
        request: request || '',
        basePath,
      },
      {},
      function (err, str) {
        if (err) {
          console.log(chalk.red(err.toString()));
        }
        fs.writeFileSync(path.join(apiPath, groupKey + '.dart'), str);
        console.log(chalk.green(`渲染成功：${groupKey + '.dart'}`));
      },
    );
  });
}

function generateParamModel(pathGroups: { [key: string]: { url: string; apiInfo: any }[] }, outDir: any) {
  const modelDirPath = path.join(process.cwd(), outDir + '/models'); //存放api文件地址
  if (fs.existsSync(modelDirPath)) {
    fs.rmSync(modelDirPath, { recursive: true });
  }
  if (!fs.existsSync(modelDirPath)) {
    fs.mkdirSync(modelDirPath, { recursive: true });
  }
  const allParamName: string[] = [];
  _.map(pathGroups, (pathGroup: any[]) => {
    pathGroup.forEach((item: { apiInfo: any }) => {
      const { apiInfo } = item;
      let { operationId, parameters = [] } = apiInfo[Object.keys(apiInfo)[0]];
      operationId = operationId.replace(/[\s|_]/g, '');
      operationId = replaceX(operationId);
      const upperOperationId = upperFirst(operationId);
      const paramName = `Params${upperFirst(operationId)}`;

      if (!allParamName.includes(paramName)) {
        allParamName.push(paramName);
      }

      // 生成 model
      ejs.renderFile(
        path.join(__dirname, '../templates/dart/models.ejs'),
        {
          paramName: paramName,
          upperOperationId: upperOperationId,
          parameters: parameters,
          generateParamProperty,
        },
        {},
        function (err, str) {
          if (err) {
            console.log(chalk.red(err.toString()));
          }
          fs.writeFileSync(path.join(modelDirPath, paramName + '.dart'), str);
          // successLog(path.join(genetatePathDir, `view.dart`));
        },
      );
    });
  });

  // 生成 model index
  ejs.renderFile(
    path.join(__dirname, '../templates/dart/models_index.ejs'),
    {
      allParamName: allParamName,
    },
    {},
    function (err, str) {
      if (err) {
        console.log(chalk.red(err.toString()));
      }
      fs.writeFileSync(path.join(modelDirPath, `model.dart`), str);
      // successLog(path.join(genetatePathDir, `view.dart`));
    },
  );
}

function generateEntity(definitions: any, outDir: string) {
  const entityDir = path.join(process.cwd(), outDir + '/entity'); //存放api文件地址
  if (fs.existsSync(entityDir)) {
    fs.rmSync(entityDir, { recursive: true });
  }
  if (!fs.existsSync(entityDir)) {
    // mkdir -p
    fs.mkdirSync(entityDir, { recursive: true });
  }
  let allModels: string[] = [];
  Object.keys(definitions).forEach((modelName) => {
    const { required = [], properties = {} } = definitions[modelName];

    allModels.push(replaceX(modelName));

    // 生成 entities
    ejs.renderFile(
      path.join(__dirname, '../templates/dart/entities.ejs'),
      {
        modelName: replaceX(modelName),
        required,
        properties,
        generateModelProperty,
      },
      {},
      function (err, str) {
        if (err) {
          console.log(chalk.red(err.toString()));
        }
        fs.writeFileSync(path.join(entityDir, `${replaceX(modelName)}.dart`), str);
      },
    );
  });

  // 生成 entities
  ejs.renderFile(
    path.join(__dirname, '../templates/dart/entitie_index.ejs'),
    {
      allModels: allModels,
    },
    {},
    function (err, str) {
      if (err) {
        console.log(chalk.red(err.toString()));
      }
      fs.writeFileSync(path.join(entityDir, `entity.dart`), str);
    },
  );
}
