import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import _, { camelCase, upperFirst } from 'lodash';
import successLog from '../utils/success';

async function run() {
  const config = require(path.join(process.cwd(), './.generate.config.js'));

  const {
    pages = [],
  } = config;

  pages.forEach(async (page: any) => {
    const { name, outDir } = page;
    const controllerFilePath = path.join(process.cwd(), `${outDir}/${name}/index.tsx`);

    const modsDir = path.join(process.cwd(), `${outDir}/${name}/mods/.gitkeep`);
    fs.mkdir(path.dirname(modsDir), { recursive: true }, function (err) {
      fs.writeFileSync(modsDir, '');
    });

    const lessDir = path.join(process.cwd(), `${outDir}/${name}/index.less`);
    fs.mkdir(path.dirname(modsDir), { recursive: true }, function (err) {
      fs.writeFileSync(lessDir, '');
    });

    fs.mkdir(path.dirname(controllerFilePath), { recursive: true }, function (err) {
      ejs.renderFile(
        path.join(__dirname, '../../templates/umi/template-table.ejs'),
        {
          pageName: upperFirst(camelCase(name)),
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


};

run();