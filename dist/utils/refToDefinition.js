"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const refToDefinition = ($ref) => {
    if (!$ref) {
        return 'any';
    }
    $ref = $ref.replace(/#\/definitions\//g, '');
    $ref = $ref.replace(/#\/components\/schemas\//g, '');
    return $ref;
};
exports.default = refToDefinition;
