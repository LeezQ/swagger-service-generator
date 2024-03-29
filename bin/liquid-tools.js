#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();

program.name('liquid-tools').description('CLI to some JavaScript ').version('1.3.6');

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

program.parse(process.argv);
