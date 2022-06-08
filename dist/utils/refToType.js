"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const refToType = (schema) => {
    let { type = 'any', $ref } = schema || {};
    if (!$ref) {
        return type;
    }
    $ref = $ref.replace(/#\/|»/g, '');
    $ref = $ref.replace(/[\/|\«|\,](.)/g, function (all, letter) {
        if (all.startsWith('«') || all.startsWith('»') || all.startsWith(',')) {
            return letter.toUpperCase();
        }
        return '.' + letter.toUpperCase();
    });
    return (0, lodash_1.upperFirst)($ref);
};
exports.default = refToType;
