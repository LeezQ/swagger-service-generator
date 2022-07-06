"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const ejs_1 = tslib_1.__importDefault(require("ejs"));
const lodash_1 = tslib_1.__importStar(require("lodash"));
const success_1 = tslib_1.__importDefault(require("../utils/success"));
function run() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const config = require(path_1.default.join(process.cwd(), './.generate.config.js'));
        const { pages = [], } = config;
        pages.forEach((page) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { name, outDir } = page;
            const controllerFilePath = path_1.default.join(process.cwd(), `${outDir}/${name}/index.tsx`);
            const modsDir = path_1.default.join(process.cwd(), `${outDir}/${name}/mods/.gitkeep`);
            fs_1.default.mkdir(path_1.default.dirname(modsDir), { recursive: true }, function (err) {
                fs_1.default.writeFileSync(modsDir, '');
            });
            const lessDir = path_1.default.join(process.cwd(), `${outDir}/${name}/index.less`);
            fs_1.default.mkdir(path_1.default.dirname(modsDir), { recursive: true }, function (err) {
                fs_1.default.writeFileSync(lessDir, '');
            });
            fs_1.default.mkdir(path_1.default.dirname(controllerFilePath), { recursive: true }, function (err) {
                ejs_1.default.renderFile(path_1.default.join(__dirname, '../../templates/umi/template-table.ejs'), {
                    pageName: (0, lodash_1.upperFirst)((0, lodash_1.camelCase)(name)),
                    lodash: lodash_1.default,
                }, {}, function (err, str) {
                    fs_1.default.writeFileSync(controllerFilePath, str);
                    (0, success_1.default)(controllerFilePath);
                });
            });
        }));
    });
}
;
run();
