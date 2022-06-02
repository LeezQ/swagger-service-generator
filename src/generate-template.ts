import * as path from 'path';
import * as fs from 'fs';
import ejs from 'ejs';
import inquirer from 'inquirer';

import _ from 'lodash';

import successLog from './utils/success';
import chalk from 'chalk';

async function run() {
  const questions = [
    {
      name: 'fileDirName',
      type: 'input',
      message: '请输入文件名称',
    },
  ];
  const { fileDirName = '' } = await inquirer.prompt(questions);

  const genetatePathDir = path.join(process.cwd(), fileDirName);

  // name 变量
  const upperName = _.upperFirst(_.camelCase(fileDirName));

  if (fs.existsSync(genetatePathDir)) {
    console.log(chalk.red(`${genetatePathDir} 已存在`));
    return;
  }

  if (!fs.existsSync(genetatePathDir)) {
    console.log(`生成文件夹.`);
    fs.mkdirSync(genetatePathDir, { recursive: true });
  }

  // 生成 binding
  ejs.renderFile(
    path.join(__dirname, '../templates/getx/binding.ejs'),
    {
      data: {
        name: upperName,
      },
    },
    {},
    function (err, str) {
      fs.writeFileSync(path.join(genetatePathDir, `bindings.dart`), str);
      successLog(path.join(genetatePathDir, `bindings.dart`));
    },
  );

  // 生成 controller
  ejs.renderFile(
    path.join(__dirname, '../templates/getx/controller.ejs'),
    {
      data: {
        name: upperName,
      },
    },
    {},
    function (err, str) {
      fs.writeFileSync(path.join(genetatePathDir, `controller.dart`), str);
      successLog(path.join(genetatePathDir, `controller.dart`));
    },
  );

  // 生成 view
  ejs.renderFile(
    path.join(__dirname, '../templates/getx/view.ejs'),
    {
      data: {
        name: upperName,
      },
    },
    {},
    function (err, str) {
      fs.writeFileSync(path.join(genetatePathDir, `view.dart`), str);
      successLog(path.join(genetatePathDir, `view.dart`));
    },
  );
}

run();
