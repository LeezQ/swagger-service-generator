"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const urlToCamelCase = (url) => {
    return url.replace(/[\/|\_|\?\=](\w)/g, function (all, letter) {
        return letter.toUpperCase();
    });
};
exports.default = urlToCamelCase;
