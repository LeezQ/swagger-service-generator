#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();

program.name('liquid-tools').description('CLI to some JavaScript ').version('0.8.0');

program
  .command('api-generate')
  .option('-t, --type <type>', '类型')
  .description('生成api')
  .action((options) => {
    const { type } = options;
    console.log(type);
    if (type === 'typescript') {
      require('../dist/generate-ts');
    } else if (type === 'dart') {
      require('../dist/generate-dart');
    }
  });

program
  .command('file-generate')
  .option('-t, --type <type>', '类型')
  .description('生成 file')
  .action((options) => {
    const { type } = options;
    console.log(type);
    if (type === 'getx') {
      require('../dist/generate-getx-template');
    }
  });

program
  .command('umi-generate')
  .option('-t, --type <type>', '类型')
  .description('生成 umi page')
  .action((options) => {
    const { type } = options;
    console.log(type);
    require('../dist/generate-umi-page');
  });

program
  .command('model-generate')
  .option('-t, --type <type>', '类型')
  .description('生成 file')
  .action((options) => {
    // require('../dist/generate-node/generate-model');
    // require('../dist/generate-egg-template');
    require('../dist/generate-midway-template');
  });

program.parse(process.argv);
