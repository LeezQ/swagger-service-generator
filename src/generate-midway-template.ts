import * as path from 'path';
import * as fs from 'fs';
import ejs from 'ejs';

import _, { camelCase, upperFirst } from 'lodash';

import successLog from './utils/success';

async function run() {
  const config = require(path.join(process.cwd(), './.generate.config.js'));
  const { routes = {}, controllerDir = '' } = config;

  _.map(routes, (value, key) => {
    // 获取最后一个
    const pathArr = key.split('/');
    const controllerFileName = pathArr[pathArr.length - 1];
    const controllerFilePath = path.join(process.cwd(), controllerDir, `/${key}.controller.ts`);

    fs.mkdir(path.dirname(controllerFilePath), { recursive: true }, function (err) {
      ejs.renderFile(
        path.join(__dirname, '../templates/node/midway-controller.ejs'),
        {
          controllerName: upperFirst(camelCase(controllerFileName)),
          fileName: controllerFileName,
          routeKey: key,
        },
        {},
        function (err, str) {
          fs.writeFileSync(controllerFilePath, str);
          successLog(controllerFilePath);
        },
      );
    });
  });
}

run();
