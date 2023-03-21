"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMiniProgramProjectJson = exports.isMiniProgramProjectJsonKey = void 0;
const shared_1 = require("@vue/shared");
const merge_1 = require("merge");
const json_1 = require("../json");
const projectKeys = [
    'appid',
    'setting',
    'miniprogramRoot',
    'cloudfunctionRoot',
    'qcloudRoot',
    'pluginRoot',
    'compileType',
    'libVersion',
    'projectname',
    'packOptions',
    'debugOptions',
    'scripts',
    'cloudbaseRoot',
];
function isMiniProgramProjectJsonKey(name) {
    return projectKeys.includes(name);
}
exports.isMiniProgramProjectJsonKey = isMiniProgramProjectJsonKey;
function parseMiniProgramProjectJson(jsonStr, platform, { template, pagesJson }) {
    const projectJson = JSON.parse(JSON.stringify(template));
    const manifestJson = (0, json_1.parseJson)(jsonStr);
    if (manifestJson) {
        projectJson.projectname = manifestJson.name;
        const platformConfig = manifestJson[platform];
        if (platformConfig) {
            projectKeys.forEach((name) => {
                if ((0, shared_1.hasOwn)(platformConfig, name)) {
                    if ((0, shared_1.isPlainObject)(platformConfig[name]) &&
                        (0, shared_1.isPlainObject)(projectJson[name])) {
                        ;
                        projectJson[name] = (0, merge_1.recursive)(true, projectJson[name], platformConfig[name]);
                    }
                    else {
                        ;
                        projectJson[name] = platformConfig[name];
                    }
                }
            });
        }
    }
    // 其实仅开发期间 condition 生效即可，暂不做判断
    const miniprogram = parseMiniProgramCondition(pagesJson);
    if (miniprogram) {
        if (!projectJson.condition) {
            projectJson.condition = {};
        }
        projectJson.condition.miniprogram = miniprogram;
    }
    if (!projectJson.appid) {
        projectJson.appid = 'touristappid';
    }
    return projectJson;
}
exports.parseMiniProgramProjectJson = parseMiniProgramProjectJson;
function parseMiniProgramCondition(pagesJson) {
    const launchPagePath = process.env.UNI_CLI_LAUNCH_PAGE_PATH || '';
    if (launchPagePath) {
        return {
            current: 0,
            list: [
                {
                    id: 0,
                    name: launchPagePath,
                    pathName: launchPagePath,
                    query: process.env.UNI_CLI_LAUNCH_PAGE_QUERY || '', // 启动参数，在页面的onLoad函数里面得到。
                },
            ],
        };
    }
    const condition = pagesJson.condition;
    if (!condition || !(0, shared_1.isArray)(condition.list) || !condition.list.length) {
        return;
    }
    condition.list.forEach(function (item, index) {
        item.id = item.id || index;
        if (item.path) {
            item.pathName = item.path;
            delete item.path;
        }
    });
    return condition;
}
//# sourceMappingURL=project.js.map