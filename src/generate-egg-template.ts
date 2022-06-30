import * as path from 'path';
import * as fs from 'fs';
import ejs from 'ejs';

import _, { camelCase, upperFirst } from 'lodash';

import successLog from './utils/success';

async function run() {
  const config = require(path.join(process.cwd(), './.generate.config.js'));
  const { routes = {} } = config;

  _.map(routes, (value, key) => {
    // 获取最后一个
    const pathArr = key.split('.');
    const controllerFileName = pathArr[pathArr.length - 1];
    const controllerFilePath = path.join(process.cwd(), `app/${pathArr.join('/')}.js`);

    fs.mkdir(path.dirname(controllerFilePath), { recursive: true }, function (err) {
      ejs.renderFile(
        path.join(__dirname, '../templates/node/egg-controller.ejs'),
        {
          controllerName: upperFirst(camelCase(controllerFileName)),
          methods: value,
          lodash: _,
        },
        {},
        function (err, str) {
          fs.writeFileSync(controllerFilePath, str);
          successLog(controllerFilePath);
        },
      );
    });
  });

  // 生成路由文件
  const routerFilePath = path.join(process.cwd(), `app/router.js`);

  fs.mkdir(path.dirname(routerFilePath), { recursive: true }, function (err) {
    ejs.renderFile(
      path.join(__dirname, '../templates/node/egg-router.ejs'),
      {
        pathList: routes,
        lodash: _,
      },
      {},
      function (err, str) {
        fs.writeFileSync(routerFilePath, str);
        successLog(routerFilePath);
      },
    );
  });
}

run();
