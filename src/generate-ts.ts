import chalk from 'chalk';
import ejs from 'ejs';
import getSwaggerJson from './utils/getSwaggerJson';
import urlToCamelCase from './utils/urlToCamelCase';
import fs from 'fs';
import path from 'path';
import * as _ from 'lodash';
import refToType from './utils/refToType';
import { upperFirst } from 'lodash';

const { default: dtsgenerator, parseSchema } = require('dtsgenerator');

type ApiDocType = {
  type: 'swagger' | 'openapi' | 'other';
  version: string;
};

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
  let {
    swaggerPath,
    outDir = 'src/services',
    basePath = '/',
    typingFileName = 'api.d.ts',
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
    parseType = (apiInfo: any, method: string, functionName: string, apiDocType: ApiDocType) => {
      let paramsType = 'any';
      let responseType = 'any';

      if (apiDocType.type === 'swagger') {
        let paramsTypeSchema = _.get(apiInfo, `${method}.parameters[0].schema`);
        let responsesTypeSchema = _.get(apiInfo, `${method}.responses.200.schema`);

        let parameters = _.get(apiInfo, `${method}.parameters`);
        let operationId = _.get(apiInfo, `${method}.operationId`);
        if (!operationId) {
          operationId = `${_.upperFirst(functionName)}${_.upperFirst(method)}`;
        }

        if (paramsTypeSchema) {
          paramsType = refToType(paramsTypeSchema);
        } else {
          if (_.find(parameters, { in: 'query' })) {
            paramsType = `Paths.${upperFirst(operationId)}.QueryParameters`;
          } else if (_.find(parameters, { in: 'body' }) || _.find(parameters, { in: 'path' })) {
            const name = _.find(parameters, { in: 'body' }).name;
            paramsType = `Paths.${upperFirst(operationId)}.Parameters.${upperFirst(name)},
            )}`;
          } else {
            paramsType = `{}`;
          }
        }

        if (responsesTypeSchema) {
          responseType = refToType(responsesTypeSchema);
        }
      } else if (apiDocType.type === 'openapi') {
        let paramsTypeSchema = _.get(apiInfo, `${method}.requestBody.content.application/json.schema`);

        let parameters = _.get(apiInfo, `${method}.parameters`);
        let operationId = _.get(apiInfo, `${method}.operationId`);
        if (!operationId) {
          operationId = `${_.upperFirst(functionName)}${_.upperFirst(method)}`;
        }

        if (paramsTypeSchema) {
          paramsType = refToType(paramsTypeSchema);
        } else {
          if (_.find(parameters, { in: 'query' })) {
            paramsType = `Paths.${upperFirst(operationId)}.QueryParameters`;
          } else if (_.find(parameters, { in: 'body' }) || _.find(parameters, { in: 'path' })) {
            const name = _.find(parameters, { in: 'body' }).name;
            paramsType = `Paths.${upperFirst(operationId)}.Parameters.${upperFirst(name)},
            )}`;
          } else {
            paramsType = `{}`;
          }
        }

        let responsesTypeSchema = _.get(apiInfo, `${method}.responses.200.content.*/*.schema`);
        if (responsesTypeSchema) {
          responseType = refToType(responsesTypeSchema);
        }
      }

      return {
        paramsType,
        responseType,
      };
    },
    whiteList,
  } = configItem;
  const apiPath = path.join(process.cwd(), outDir); //存放api文件地址
  if (!fs.existsSync(apiPath)) {
    // mkdir -p
    fs.mkdirSync(apiPath, { recursive: true });
  }
  const res = await getSwaggerJson(swaggerPath);
  const { paths } = res.data || {};

  let apiDocType: ApiDocType;

  if (res.data?.swagger) {
    apiDocType = {
      type: 'swagger',
      version: res.data?.swagger,
    };
  } else if (res.data?.openapi) {
    apiDocType = {
      type: 'openapi',
      version: res.data?.openapi,
    };
  }

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
    pathGroup = pathGroup.map((item: any) => {
      let { apiInfo, url } = item;
      const method = Object.keys(apiInfo)[0];
      let { summary = '', operationId = '', consumes = '' } = apiInfo[method];

      let functionName = functionNameRule(url, operationId);

      let { paramsType, responseType } = parseType(apiInfo, method, functionName, apiDocType);

      return {
        url,
        summary,
        paramsType,
        responseType,
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

  dtsgenerator({
    contents: [parseSchema(res.data)],
  })
    .then((generatedContent: any) => {
      fs.writeFile(
        path.join(apiPath, typingFileName),
        `/* eslint-disable */
      ${generatedContent}`,
        { flag: 'w' },
        (err: any) => {
          if (err) {
            return console.log(err);
          }
        },
      );
    })
    .catch((err: any) => {
      console.log(err);
    });
}
