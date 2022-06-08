#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();

program
  .name('liquid-tools')
  .description('CLI to some JavaScript ')
  .version('0.8.0');

program
  .command('api-generate')
  .option('-t, --type <type>', '类型')
  .description('生成api')
  .action((options) => {
    const { type } = options;
    console.log(type);
    if (type === 'typescript') {
      require('../dist/generate-ts');
    }

  });

program.parse(process.argv);