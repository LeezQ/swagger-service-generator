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
        const { routes = {} } = config;
        lodash_1.default.map(routes, (value, key) => {
            // 获取最后一个
            const pathArr = key.split('.');
            const controllerFileName = pathArr[pathArr.length - 1];
            const controllerFilePath = path.join(process.cwd(), `app/${pathArr.join('/')}.js`);
            fs.mkdir(path.dirname(controllerFilePath), { recursive: true }, function (err) {
                ejs_1.default.renderFile(path.join(__dirname, '../templates/node/egg-controller.ejs'), {
                    controllerName: (0, lodash_1.upperFirst)((0, lodash_1.camelCase)(controllerFileName)),
                    methods: value,
                    lodash: lodash_1.default,
                }, {}, function (err, str) {
                    fs.writeFileSync(controllerFilePath, str);
                    (0, success_1.default)(controllerFilePath);
                });
            });
        });
        // 生成路由文件
        const routerFilePath = path.join(process.cwd(), `app/router.js`);
        fs.mkdir(path.dirname(routerFilePath), { recursive: true }, function (err) {
            ejs_1.default.renderFile(path.join(__dirname, '../templates/node/egg-router.ejs'), {
                pathList: routes,
                lodash: lodash_1.default,
            }, {}, function (err, str) {
                fs.writeFileSync(routerFilePath, str);
                (0, success_1.default)(routerFilePath);
            });
        });
    });
}
run();
