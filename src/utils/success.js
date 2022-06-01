"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const successLog = (filepath) => {
    console.log(chalk_1.default.green(`Done! File created at ${filepath}`));
};
exports.default = successLog;
