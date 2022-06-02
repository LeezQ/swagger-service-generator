"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = tslib_1.__importStar(require("path"));
const fs = tslib_1.__importStar(require("fs"));
const ejs_1 = tslib_1.__importDefault(require("ejs"));
const inquirer_1 = tslib_1.__importDefault(require("inquirer"));
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const success_1 = tslib_1.__importDefault(require("./utils/success"));
const chalk_1 = tslib_1.__importDefault(require("chalk"));
function run() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const questions = [
            {
                name: 'fileDirName',
                type: 'input',
                message: '请输入文件名称',
            },
        ];
        const { fileDirName = '' } = yield inquirer_1.default.prompt(questions);
        const genetatePathDir = path.join(process.cwd(), fileDirName);
        // name 变量
        const upperName = lodash_1.default.upperFirst(lodash_1.default.camelCase(fileDirName));
        if (fs.existsSync(genetatePathDir)) {
            console.log(chalk_1.default.red(`${genetatePathDir} 已存在`));
            return;
        }
        if (!fs.existsSync(genetatePathDir)) {
            console.log(`生成文件夹.`);
            fs.mkdirSync(genetatePathDir, { recursive: true });
        }
        // 生成 binding
        ejs_1.default.renderFile(path.join(__dirname, '../templates/getx/binding.ejs'), {
            data: {
                name: upperName,
            },
        }, {}, function (err, str) {
            fs.writeFileSync(path.join(genetatePathDir, `bindings.dart`), str);
            (0, success_1.default)(path.join(genetatePathDir, `bindings.dart`));
        });
        // 生成 controller
        ejs_1.default.renderFile(path.join(__dirname, '../templates/getx/controller.ejs'), {
            data: {
                name: upperName,
            },
        }, {}, function (err, str) {
            fs.writeFileSync(path.join(genetatePathDir, `controller.dart`), str);
            (0, success_1.default)(path.join(genetatePathDir, `controller.dart`));
        });
        // 生成 view
        ejs_1.default.renderFile(path.join(__dirname, '../templates/getx/view.ejs'), {
            data: {
                name: upperName,
            },
        }, {}, function (err, str) {
            fs.writeFileSync(path.join(genetatePathDir, `view.dart`), str);
            (0, success_1.default)(path.join(genetatePathDir, `view.dart`));
        });
    });
}
run();
