import chalk from 'chalk';
import ejs from 'ejs';
import getSwaggerJson from './utils/getSwaggerJson';
import urlToCamelCase from './utils/urlToCamelCase';

//引入依赖
var fs = require('fs');

var path = require('path');
require('colors');
var _ = require('lodash');
const { default: dtsgenerator, parseSchema } = require('dtsgenerator');

const config = require(path.join(process.cwd(), './swagger.config.js'));

if (Array.isArray(config)) {
  config.forEach(async (config) => {
    await run(config);
  });
}

//启动函数
async function run(configItem: any) {
  console.log(chalk.yellow(`读取json数据...`));
  let {
    swaggerPath,
    outDir,
    basePath,
    typingFileName = 'api.d.ts',
    request = `import request from 'umi-request';`,
    fileNameRule = function (url: string) {
      return url.split('/').pop();
    },
    functionNameRule = function (url: string, operationId: string) {
      if (operationId !== '') {
        return urlToCamelCase(operationId);
      }
      return urlToCamelCase(url.replace(/^\//, ''));
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
    ejs.renderFile(
      path.join(__dirname, '../templates/ts/function_service.ejs'),
      {
        request,
        basePath,
        typingFileName,
        pathGroup,
        urlToCamelCase,
        upperCaseFirstLetter,
        functionNameRule: functionNameRule,
        _,
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
          console.log(chalk.green(`types are generated.`));
        },
      );
    })
    .catch((err: any) => {
      console.log(err);
    });
}

function upperCaseFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
