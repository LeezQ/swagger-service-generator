//引入依赖
var fs = require('fs');

var path = require('path');
require('colors');
var axios = require('axios');
var _ = require('lodash');
const { default: dtsgenerator, parseSchema } = require('dtsgenerator');

const config = require(path.join(process.cwd(), './swagger.config.json'));

//启动函数
async function run() {
  console.log(`读取json数据......`.yellow);
  console.log(`config......${JSON.stringify(config)}`.green);
  const { url, outDir, request = `import request from 'umi-request';`, fileNameReg = '/(.*?)/' } = config;
  const apiPath = path.join(process.cwd(), outDir); //存放api文件地址
  if (!fs.existsSync(apiPath)) {
    // mkdir -p
    fs.mkdirSync(apiPath, { recursive: true });
  }
  const res = await getData(url);
  const { paths, basePath } = res.data;
  let pathGroups = {};
  _.map(paths, (item, urlPath) => {
    const groupKey = urlPath.match(new RegExp(fileNameReg))[1] || 'default';
    if (Object.keys(pathGroups).includes(groupKey)) {
      pathGroups[groupKey].push({
        url: urlPath,
        apiInfo: item,
      });
    } else {
      pathGroups[groupKey] = [{
        url: urlPath,
        apiInfo: item,
      }];
    }
  });


  _.map(pathGroups, (pathGroup, groupKey) => {
    const fileName = groupKey + '.ts';

    let content = `
/// <reference path = "api.d.ts" />
${request}
`;
    pathGroup.forEach((item) => {
      const { apiInfo, url } = item;

      const method = Object.keys(apiInfo)[0];
      let { operationId, summary, parameters, consumes } = apiInfo[method];

      operationId = operationId.replace(/_/g, '');

      let upperOperationId = upperCaseFirstLetter(operationId);

      let paramsType = '';

      if (_.find(parameters, { in: 'query' })) {
        paramsType = `Paths.${upperOperationId}.QueryParameters`;
      } else if (_.find(parameters, { in: 'body' })) {
        const name = _.find(parameters, { in: 'body' }).name;
        paramsType = `Paths.${upperOperationId}.Parameters.${upperCaseFirstLetter(name)}`;
      } else if (_.find(parameters, { in: 'path' })) {
        const name = _.find(parameters, { in: 'body' }).path;
        paramsType = `Paths.${upperOperationId}.Parameters.${upperCaseFirstLetter(name)}`;
      } else {
        paramsType = `{}`;
      }

      let responseType = `Paths.${upperOperationId}.Responses.$200`;

      let _funcString = `
// ${summary}
export async function ${operationId}(
  params: ${paramsType},
  extra?: { [key: string]: any },
): Promise<${responseType}> {
  return request('${basePath}${url}', {
    method: '${method.toUpperCase()}',
    data: params,
    ...(extra || {}),
  });
}
      `;
      content += _funcString;
    });

    fs.writeFileSync(path.join(apiPath, fileName), content);

  });

  dtsgenerator({
    contents: [parseSchema(res.data)],

  }).then(generatedContent => {
    fs.writeFile(
      path.join(apiPath, 'api.d.ts'),
      `/* eslint-disable */
      ${generatedContent}`,
      { flag: 'w' },
      (err) => {
        if (err) {
          return console.log(err);
        }
        console.log(`types are generated.`.green);
      },
    );
  }).catch(err => {
    console.log(err);
  });
}

//获取swagger.json数据
async function getData(url) {
  return await axios({ url: url, method: 'get' });
}

function upperCaseFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

run();
