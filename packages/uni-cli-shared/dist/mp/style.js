"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformScopedCss = void 0;
function transformScopedCss(cssCode) {
    return cssCode.replace(/\[(data-v-[a-f0-9]{8})\]/gi, (_, scopedId) => {
        return '.' + scopedId;
    });
}
exports.transformScopedCss = transformScopedCss;
//# sourceMappingURL=style.js.map