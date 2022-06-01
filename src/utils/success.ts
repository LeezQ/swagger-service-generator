import chalk from 'chalk';
const successLog = (filepath: string) => {
  console.log(chalk.green(`Done! File created at ${filepath}`));
};

export default successLog;
