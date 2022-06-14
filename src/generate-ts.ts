import chalk from 'chalk';
import ejs from 'ejs';
import getSwaggerJson from './utils/getSwaggerJson';
import urlToCamelCase from './utils/urlToCamelCase';
import fs from 'fs';
import path from 'path';
import * as _ from 'lodash';
import generateBodyParams from './utils/generateBodyParams';
import generateProperties from './utils/generateProperties';
import refToDefinition from './utils/refToDefinition';
import replaceX from './utils/replaceX';
import { upperFirst } from 'lodash';
import generateQueryParams from './utils/generateQueryParams';

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
  let { paths, definitions = {}, components = { schemas: {} }, openapi, swagger } = res.data || {};

  if (_.isEmpty(definitions)) {
    definitions = components.schemas;
  }

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

    let bodyParamsType = 'any';
    let queryParamsType = 'any';
    let responsesType = 'any';

    let functionName = functionNameRule(urlPath, _.get(item, `${method}.operationId`));

    if (swagger) {
      const parameters = _.get(item, `${method}.parameters`, []);

      // query params
      const queryParams = parameters.filter((item: any) => item.in === 'query');
      queryParamsType = generateQueryParams(queryParams);

      // body params
      const bodyParams = parameters.filter((item: any) => item.in === 'body');
      bodyParamsType = generateBodyParams(bodyParams[0]);
      addDefinitionData(_.get(bodyParams, '[0].schema.$ref'), _definitionsData, definitions);

      // responses params
      let response = `${method}.responses.200`;
      responsesType = generateBodyParams(_.get(item, `${response}`));
      addDefinitionData(_.get(item, `${method}.responses.200.schema.$ref`), _definitionsData, definitions);
    } else if (openapi) {
      let request = `${method}.requestBody.content.application/json`;
      bodyParamsType = generateBodyParams(_.get(item, `${request}`));
      addDefinitionData(_.get(item, `${request}.schema.$ref`), _definitionsData, definitions);

      let response = `${method}.responses.200.content.*/*`;
      responsesType = generateBodyParams(_.get(item, `${response}`));
      addDefinitionData(_.get(item, `${response}.schema.$ref`), _definitionsData, definitions);
    }

    pathsData[functionName] = {
      nameSpace: _.upperFirst(functionName),
      queryParamsType,
      bodyParamsType,
      responsesType,
    };
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
            _defi[item.items.$ref] = definitions[refToDefinition(item.items.$ref)];
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

function generateTsServices(configItem: any, res: { data?: import('./typing').SwaggerJson | undefined }) {
  let { outDir, basePath, typingFileName, request, fileNameRule, functionNameRule, whiteList } = configItem;
  const apiPath = path.join(process.cwd(), outDir); //存放api文件地址
  if (!fs.existsSync(apiPath)) {
    // mkdir -p
    fs.mkdirSync(apiPath, { recursive: true });
  }
  const { paths, openapi, swagger } = res.data || {};

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

  _.map(pathGroups, (pathGroup: any[], groupKey: any) => {
    pathGroup = pathGroup.map((pathItem: any) => {
      let { apiInfo, url } = pathItem;
      const method = Object.keys(apiInfo)[0];
      let { summary = '', operationId = '', consumes = '' } = apiInfo[method];

      let functionName = functionNameRule(url, operationId);

      let queryParamsType = `any`;
      let bodyParamsType = `any`;
      let responsesType = `any`;

      let item = pathItem.apiInfo;
      if (swagger) {
        const parameters = _.get(item, `${method}.parameters`, []);

        // query params
        const queryParams = parameters.filter((item: any) => item.in === 'query');
        queryParamsType = generateQueryParams(queryParams);

        // body params
        const bodyParams = parameters.filter((item: any) => item.in === 'body');
        bodyParamsType = generateBodyParams(bodyParams[0]);

        // responses params
        let response = `${method}.responses.200`;
        responsesType = generateBodyParams(_.get(item, `${response}`));
      } else if (openapi) {
        let request = `${method}.requestBody.content.application/json`;
        bodyParamsType = generateBodyParams(_.get(item, `${request}`));

        let response = `${method}.responses.200.content.*/*`;
        responsesType = generateBodyParams(_.get(item, `${response}`));
      }

      return {
        url,
        summary,
        bodyParamsType: bodyParamsType === 'any' ? queryParamsType : bodyParamsType,
        responsesType,
        consumes,
        method,
        functionName,
      };
    });

    ejs.renderFile(
      path.join(__dirname, '../templates/ts/function_service.ejs'),
      {
        request,
        basePath,
        typingFileName,
        pathGroup,
        functionNameRule: functionNameRule,
        functionName: '',
      },
      {},
      (err: any, data: any) => {
        if (err) {
          console.log(chalk.red(`渲染失败：${err}`));
        } else {
          fs.writeFileSync(path.join(apiPath, groupKey + '.ts'), data);
          console.log(chalk.green(`渲染成功：${groupKey + '.ts'}`));
        }
      },
    );
  });
}

function addDefinitionData(ref: any, _definitionsData: any, definitions: any) {
  if (ref) {
    _definitionsData[ref] = definitions[refToDefinition(ref)];
  }
}
