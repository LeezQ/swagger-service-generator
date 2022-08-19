"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = tslib_1.__importStar(require("path"));
const fs = tslib_1.__importStar(require("fs"));
const ejs_1 = tslib_1.__importDefault(require("ejs"));
const lodash_1 = tslib_1.__importStar(require("lodash"));
const success_1 = tslib_1.__importDefault(require("./utils/success"));
function run() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const config = require(path.join(process.cwd(), './.generate.config.js'));
        const { routes = {}, controllerDir = '' } = config;
        lodash_1.default.map(routes, (value, key) => {
            // 获取最后一个
            const pathArr = key.split('/');
            const controllerFileName = pathArr[pathArr.length - 1];
            const controllerFilePath = path.join(process.cwd(), controllerDir, `/${key}.controller.ts`);
            fs.mkdir(path.dirname(controllerFilePath), { recursive: true }, function (err) {
                ejs_1.default.renderFile(path.join(__dirname, '../templates/node/midway-controller.ejs'), {
                    controllerName: (0, lodash_1.upperFirst)((0, lodash_1.camelCase)(controllerFileName)),
                    fileName: controllerFileName,
                    routeKey: key,
                }, {}, function (err, str) {
                    fs.writeFileSync(controllerFilePath, str);
                    (0, success_1.default)(controllerFilePath);
                });
            });
        });
    });
}
run();
