"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheTips = exports.customResourceChangedTips = exports.customResourceTips = void 0;
function customResourceTips(id) {
    return `uts插件[${id}]依赖的原生配置或三方SDK在运行至标准基座时不能生效，如需正常调用请使用自定义基座`;
}
exports.customResourceTips = customResourceTips;
function customResourceChangedTips(id) {
    return `uts插件[${id}]依赖的原生配置或三方SDK发生变化，需要重新打包自定义基座`;
}
exports.customResourceChangedTips = customResourceChangedTips;
function cacheTips(id) {
    return `uts插件[${id}]文件未发生变化，跳过编译`;
}
exports.cacheTips = cacheTips;
