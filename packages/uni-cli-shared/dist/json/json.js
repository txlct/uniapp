"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJson = void 0;
const jsonc_parser_1 = require("jsonc-parser");
const preprocess_1 = require("../preprocess");
function parseJson(jsonStr, shouldPre = false) {
    return (0, jsonc_parser_1.parse)(shouldPre ? (0, preprocess_1.preJson)(jsonStr) : jsonStr);
}
exports.parseJson = parseJson;
//# sourceMappingURL=json.js.map