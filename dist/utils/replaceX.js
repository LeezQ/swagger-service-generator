"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const replaceX = ($ref) => {
    if (!$ref) {
        return 'any';
    }
    $ref = $ref.replace(/\»/g, '');
    $ref = $ref.replace(/[\/|\«|\,|\»](.)/g, function (all, letter) {
        return letter.toUpperCase();
    });
    return $ref;
};
exports.default = replaceX;
