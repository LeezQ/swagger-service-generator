import chalk from 'chalk';
import ejs from 'ejs';
import getSwaggerJson from './utils/getSwaggerJson';
import urlToCamelCase from './utils/urlToCamelCase';
import fs from 'fs';
import path from 'path';
import * as _ from 'lodash';
import generateQueryParams from './utils/generateQueryParams';
import generateProperties from './utils/generateProperties';
import refToDefinition from './utils/refToDefinition';
import replaceX from './utils/replaceX';

function goGenerate() {
  const config = require(path.join(process.cwd(), './.swagger.config.js'));

  if (Array.isArray(config)) {
    config.forEach(async (config) => {
      await run(config);
    });
  }
}

goGenerate();

async function run(configItem: any) {
  const res = await getSwaggerJson(configItem.swaggerPath);

  configItem = {
    outDir: 'src/services',
    basePath: '/',
    typingFileName: 'api.d.ts',
    request: `import request from 'umi-request';`,
    fileNameRule: (url: string) => {
      return (url.split('/') || [])[1] || 'index';
    },
    functionNameRule: (url: string, operationId: string) => {
      if (operationId !== '') {
        return urlToCamelCase(operationId);
      }
      return urlToCamelCase(url.replace(/^\//, ''));
    },
    ...configItem,
  };

  generateTsServices(configItem, res);

  generateTsTypes(configItem, res);
}

function generateTsTypes(configItem: any, res: { data?: import('./typing').SwaggerJson | undefined }) {
  const { outDir, typingFileName, functionNameRule, whiteList } = configItem;
  const { paths, definitions = {} } = res.data || {};
  const typeFilePath = path.join(process.cwd(), outDir); //存放api文件地址
  if (!fs.existsSync(typeFilePath)) {
    // mkdir -p
    fs.mkdirSync(typeFilePath, { recursive: true });
  }

  let _definitionsData: {
    [key: string]: any;
  } = {};
  let pathsData: {
    [key: string]: any;
  } = {};

  _.map(paths, (item: any, urlPath: string) => {
    if (whiteList && !whiteList.includes(urlPath)) {
      return;
    }
    const method = Object.keys(item)[0];

    const operationId = _.get(item, `${method}.operationId`);
    const parameters = _.get(item, `${method}.parameters`, []);

    // body params
    const bodyParams = parameters.filter((item: any) => item.in === 'body');
    let bodyParamsType = getTypeFromRef(_.get(bodyParams, '[0].schema.$ref')) || 'any';

    // query params
    const queryParams = parameters.filter((item: any) => item.in === 'query');
    let queryParamsType = '{}';
    if (queryParams.length > 0) {
      queryParamsType = generateQueryParams(queryParams).join('');
    }

    // responses params
    const responses = _.get(item, `${method}.responses`, []);
    let responsesType = getTypeFromRef(_.get(responses, '200.schema.$ref')) || 'any';

    let functionName = functionNameRule(urlPath, operationId);

    pathsData[functionName] = {
      nameSpace: _.upperFirst(functionName),
      queryParamsType,
      bodyParamsType,
      responsesType,
    };

    if (_.get(bodyParams, '[0].schema.$ref')) {
      let ref = _.get(bodyParams, '[0].schema.$ref');
      _definitionsData[ref] = definitions[refToDefinition(ref)];
    }

    if (_.get(responses, '200.schema.$ref')) {
      let ref = _.get(responses, '200.schema.$ref');
      _definitionsData[ref] = definitions[refToDefinition(ref)];
    }
  });

  function parseDefinition(properties: any, _defi: any) {
    if (!properties) {
    } else {
      _.map(properties, (item: any) => {
        if (item.$ref) {
          _defi[item.$ref] = definitions[refToDefinition(item.$ref)];

          parseDefinition(definitions[refToDefinition(item.$ref)].properties, _defi);
        } else if (item.type === 'array') {
          if (item.items.$ref) {
            _defi[item.items.$ref] = `${item.items.$ref ? definitions[refToDefinition(item.items.$ref)] : 'any'}[]`;
            parseDefinition(definitions[refToDefinition(item.items.$ref)].properties, _defi);
          }
        }
      });
    }
    return _defi;
  }

  _.map(_definitionsData, (item: any, key: string) => {
    // 递归
    parseDefinition(item.properties, _definitionsData);
  });

  let definitionsData: any = {};
  _.map(_definitionsData, (item: any, key: string) => {
    // generate
    definitionsData[replaceX(refToDefinition(key))] = generateProperties(item);
  });

  ejs.renderFile(
    path.join(__dirname, '../templates/ts/definition.ejs'),
    {
      pathsData,
      definitionsData,
    },
    {},
    (err: any, data: any) => {
      if (err) {
        console.log(chalk.red(`渲染失败：${err}`));
      } else {
        fs.writeFileSync(path.join(typeFilePath, typingFileName), data);
        console.log(chalk.green(`渲染成功：${typingFileName}`));
      }
    },
  );
}

function getTypeFromRef(ref?: string) {
  if (!ref) {
    return;
  }
  if (ref) {
    const bodyParamsSchemaRefType = replaceX(refToDefinition(ref));
    return 'Definitions.' + bodyParamsSchemaRefType;
  }
}
