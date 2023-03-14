"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvePlatformIndex = exports.resolvePlatformIndexFilename = exports.resolveRootIndex = exports.genComponentsCode = exports.genProxyCode = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const utils_1 = require("./utils");
const shared_1 = require("./shared");
const shared_2 = require("@vue/shared");
async function genProxyCode(module, options) {
    const { name, is_uni_modules, format, moduleName, moduleType } = options;
    return `
const { initUTSProxyClass, initUTSProxyFunction, initUTSPackageName, initUTSIndexClassName, initUTSClassName } = uni
const name = '${name}'
const moduleName = '${moduleName || ''}'
const moduleType = '${moduleType || ''}'
const errMsg = \`${utils_1.ERR_MSG_PLACEHOLDER}\`
const is_uni_modules = ${is_uni_modules}
const pkg = initUTSPackageName(name, is_uni_modules)
const cls = initUTSIndexClassName(name, is_uni_modules)
${format === "cjs" /* FORMATS.CJS */
        ? `
const exports = { __esModule: true }
`
        : ''}
${genComponentsCode(format, options.androidComponents || {}, options.iosComponents || {})}

${genModuleCode(await parseModuleDecls(module, options), format, options.pluginRelativeDir)}
`;
}
exports.genProxyCode = genProxyCode;
function genComponentsCode(format = "es" /* FORMATS.ES */, androidComponents, iosComponents) {
    const codes = [];
    Object.keys(Object.assign({}, androidComponents, iosComponents)).forEach((name) => {
        if (format === "cjs" /* FORMATS.CJS */) {
            codes.push(`exports.${(0, shared_2.capitalize)((0, shared_2.camelize)(name))}Component = {}`);
        }
        else {
            codes.push(`export const ${(0, shared_2.capitalize)((0, shared_2.camelize)(name))}Component = {}`);
        }
    });
    return codes.join('\n');
}
exports.genComponentsCode = genComponentsCode;
function resolveRootIndex(module, options) {
    const filename = path_1.default.resolve(module, options.is_uni_modules ? 'utssdk' : '', `index${options.extname}`);
    return fs_1.default.existsSync(filename) && filename;
}
exports.resolveRootIndex = resolveRootIndex;
function resolvePlatformIndexFilename(platform, module, options) {
    return path_1.default.resolve(module, options.is_uni_modules ? 'utssdk' : '', platform, `index${options.extname}`);
}
exports.resolvePlatformIndexFilename = resolvePlatformIndexFilename;
function resolvePlatformIndex(platform, module, options) {
    const filename = resolvePlatformIndexFilename(platform, module, options);
    return fs_1.default.existsSync(filename) && filename;
}
exports.resolvePlatformIndex = resolvePlatformIndex;
function exportDefaultCode(format) {
    return format === "es" /* FORMATS.ES */ ? 'export default ' : 'exports.default = ';
}
function exportVarCode(format, kind) {
    if (format === "es" /* FORMATS.ES */) {
        return `export ${kind} `;
    }
    return `exports.`;
}
function genModuleCode(decls, format = "es" /* FORMATS.ES */, pluginRelativeDir) {
    const codes = [];
    const exportDefault = exportDefaultCode(format);
    const exportConst = exportVarCode(format, 'const');
    decls.forEach((decl) => {
        if (decl.type === 'Class') {
            if (decl.isDefault) {
                codes.push(`${exportDefault}initUTSProxyClass(Object.assign({ moduleName, moduleType, errMsg, package: pkg, class: initUTSClassName(name, '${decl.cls}', is_uni_modules) }, ${JSON.stringify(decl.options)} ))`);
            }
            else {
                codes.push(`${exportConst}${decl.cls} = initUTSProxyClass(Object.assign({ moduleName, moduleType, errMsg, package: pkg, class: initUTSClassName(name, '${decl.cls}', is_uni_modules) }, ${JSON.stringify(decl.options)} ))`);
            }
        }
        else if (decl.type === 'FunctionDeclaration') {
            if (decl.isDefault) {
                codes.push(`${exportDefault}initUTSProxyFunction(${decl.async}, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: '${decl.method}', params: ${JSON.stringify(decl.params)}})`);
            }
            else {
                codes.push(`${exportConst}${decl.method} = initUTSProxyFunction(${decl.async}, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: '${decl.method}', params: ${JSON.stringify(decl.params)}})`);
            }
        }
        else if (decl.type === 'VariableDeclaration') {
            if (format === "es" /* FORMATS.ES */) {
                codes.push(`export ${decl.kind} ${decl.declarations
                    .map((d) => `${d.id.value} = ${genInitCode(d.init)}`)
                    .join(', ')}`);
            }
            else if (format === "cjs" /* FORMATS.CJS */) {
                codes.push(`${decl.kind} ${decl.declarations
                    .map((d) => `${d.id.value} = ${genInitCode(d.init)}`)
                    .join(', ')}`);
                const exportVar = exportVarCode(format, decl.kind);
                decl.declarations.forEach((d) => {
                    const name = d.id.value;
                    codes.push(`${exportVar}${name} = ${name}`);
                });
            }
        }
    });
    if (format === "cjs" /* FORMATS.CJS */) {
        codes.push(`uni.registerUTSPlugin('${(0, shared_1.normalizePath)(pluginRelativeDir)}', exports)`);
    }
    return codes.join(`\n`);
}
async function parseModuleDecls(module, options) {
    // 优先合并 ios + android，如果没有，查找根目录 index.uts
    const iosDecls = await parseFile(resolvePlatformIndex('app-ios', module, options), options);
    const androidDecls = await parseFile(resolvePlatformIndex('app-android', module, options), options);
    // 优先使用 app-ios，因为 app-ios 平台函数类型需要正确的参数列表
    const decls = mergeDecls(androidDecls, iosDecls);
    // 如果没有平台特有，查找 root index.uts
    if (!decls.length) {
        return await parseFile(resolveRootIndex(module, options), options);
    }
    return decls;
}
function mergeDecls(from, to) {
    from.forEach((item) => {
        if (item.type === 'Class') {
            if (!to.find((toItem) => toItem.type === 'Class' && toItem.cls === item.cls)) {
                to.push(item);
            }
        }
        else if (item.type === 'FunctionDeclaration') {
            if (!to.find((toItem) => toItem.type === 'FunctionDeclaration' &&
                toItem.method === item.method)) {
                to.push(item);
            }
        }
        else if (item.type === 'VariableDeclaration' &&
            item.declarations.length === 1) {
            if (!to.find((toItem) => {
                if (toItem.type === 'VariableDeclaration' &&
                    toItem.declarations.length === 1) {
                    const toDecl = toItem.declarations[0].id;
                    const decl = item.declarations[0].id;
                    return (toDecl.type === 'Identifier' &&
                        decl.type === 'Identifier' &&
                        toDecl.value === decl.value);
                }
                return false;
            })) {
                to.push(item);
            }
        }
    });
    return to;
}
async function parseFile(filename, options) {
    if (filename) {
        return parseCode(fs_1.default.readFileSync(filename, 'utf8'), options.namespace);
    }
    return [];
}
async function parseCode(code, namespace) {
    // 懒加载 uts 编译器
    // eslint-disable-next-line no-restricted-globals
    const { parse } = require('@dcloudio/uts');
    const ast = await parse(code, { noColor: !(0, utils_1.isColorSupported)() });
    return parseAst(ast, (0, utils_1.createResolveTypeReferenceName)(namespace, ast));
}
function parseAst({ body }, resolveTypeReferenceName) {
    const decls = [];
    body.forEach((item) => {
        if (item.type === 'ExportDeclaration') {
            const decl = item.declaration;
            switch (decl.type) {
                case 'FunctionDeclaration':
                    decls.push(genFunctionDeclaration(decl, resolveTypeReferenceName, false));
                    break;
                case 'ClassDeclaration':
                    decls.push(genClassDeclaration(decl, resolveTypeReferenceName, false));
                    break;
                case 'VariableDeclaration':
                    const varDecl = genVariableDeclaration(decl);
                    if (varDecl) {
                        decls.push(varDecl);
                    }
                    break;
            }
        }
        else if (item.type === 'ExportDefaultDeclaration') {
            const decl = item.decl;
            if (decl.type === 'ClassExpression') {
                if (decl.identifier) {
                    // export default class test{}
                    decls.push(genClassDeclaration(decl, resolveTypeReferenceName, true));
                }
            }
            else if (decl.type === 'FunctionExpression') {
                if (decl.identifier) {
                    decls.push(genFunctionDeclaration(decl, resolveTypeReferenceName, true));
                }
            }
        }
    });
    return decls;
}
function isReturnPromise(anno) {
    if (!anno) {
        return false;
    }
    const { typeAnnotation } = anno;
    return (typeAnnotation.type === 'TsTypeReference' &&
        typeAnnotation.typeName.type === 'Identifier' &&
        typeAnnotation.typeName.value === 'Promise');
}
function genProxyFunction(method, async, params, isDefault = false) {
    return { type: 'FunctionDeclaration', method, async, params, isDefault };
}
function genProxyClass(cls, options, isDefault = false) {
    return { type: 'Class', cls, options, isDefault };
}
function resolveIdentifierDefaultValue(ident) {
    if (ident.type === 'NullLiteral') {
        return 'UTSNull';
    }
    else if (ident.type === 'StringLiteral' ||
        ident.type === 'NumericLiteral' ||
        ident.type === 'BooleanLiteral') {
        return ident.value;
    }
    return null;
}
function resolveIdentifierType(ident, resolveTypeReferenceName) {
    if (ident.typeAnnotation) {
        const { typeAnnotation } = ident.typeAnnotation;
        if (typeAnnotation.type === 'TsKeywordType') {
            return typeAnnotation.kind;
        }
        else if (typeAnnotation.type === 'TsFunctionType') {
            return 'UTSCallback';
        }
        else if (typeAnnotation.type === 'TsTypeReference' &&
            typeAnnotation.typeName.type === 'Identifier') {
            return resolveTypeReferenceName(typeAnnotation.typeName.value);
        }
        else if (typeAnnotation.type === 'TsUnionType') {
            if (typeAnnotation.types.length === 2) {
                const [type1, type2] = typeAnnotation.types;
                if (type1.type === 'TsKeywordType' && type1.kind === 'null') {
                    if (type2.type === 'TsParenthesizedType' &&
                        type2.typeAnnotation.type === 'TsFunctionType') {
                        return 'UTSCallback';
                    }
                }
                if (type2.type === 'TsKeywordType' && type2.kind === 'null') {
                    if (type1.type === 'TsParenthesizedType' &&
                        type1.typeAnnotation.type === 'TsFunctionType') {
                        return 'UTSCallback';
                    }
                }
            }
        }
    }
    return '';
}
function resolveFunctionParams(params, resolveTypeReferenceName) {
    const result = [];
    params.forEach(({ pat }) => {
        if (pat.type === 'Identifier') {
            result.push({
                name: pat.value,
                type: resolveIdentifierType(pat, resolveTypeReferenceName),
            });
        }
        else if (pat.type === 'AssignmentPattern') {
            if (pat.left.type === 'Identifier') {
                const param = {
                    name: pat.left.value,
                    type: resolveIdentifierType(pat.left, resolveTypeReferenceName),
                };
                const defaultValue = resolveIdentifierDefaultValue(pat.right);
                if (defaultValue !== null) {
                    param.default = defaultValue;
                }
                result.push(param);
            }
        }
        else {
            result.push({ name: '', type: '' });
        }
    });
    return result;
}
function genFunctionDeclaration(decl, resolveTypeReferenceName, isDefault = false) {
    return genProxyFunction(decl.identifier.value, decl.async || isReturnPromise(decl.returnType), resolveFunctionParams(decl.params, resolveTypeReferenceName), isDefault);
}
function genClassDeclaration(decl, resolveTypeReferenceName, isDefault = false) {
    const cls = decl.identifier.value;
    const constructor = { params: [] };
    const methods = {};
    const staticMethods = {};
    const props = [];
    const staticProps = [];
    decl.body.forEach((item) => {
        if (item.type === 'Constructor') {
            constructor.params = resolveFunctionParams(item.params, resolveTypeReferenceName);
        }
        else if (item.type === 'ClassMethod') {
            if (item.key.type === 'Identifier') {
                const name = item.key.value;
                const value = {
                    async: item.function.async || isReturnPromise(item.function.returnType),
                    params: resolveFunctionParams(item.function.params, resolveTypeReferenceName),
                };
                if (item.isStatic) {
                    staticMethods[name] = value;
                }
                else {
                    methods[name] = value;
                }
            }
        }
        else if (item.type === 'ClassProperty') {
            if (item.key.type === 'Identifier') {
                if (item.isStatic) {
                    staticProps.push(item.key.value);
                }
                else {
                    props.push(item.key.value);
                }
            }
        }
    });
    return genProxyClass(cls, { constructor, methods, staticMethods, props, staticProps }, isDefault);
}
function genInitCode(expr) {
    switch (expr.type) {
        case 'BooleanLiteral':
            return expr.value + '';
        case 'NumericLiteral':
            return expr.value + '';
        case 'StringLiteral':
            return expr.value;
    }
    return '';
}
function genVariableDeclaration(decl) {
    // 目前仅支持 const 的 boolean,number,string
    const lits = ['BooleanLiteral', 'NumericLiteral', 'StringLiteral'];
    if (decl.kind === 'const' &&
        !decl.declarations.find((d) => {
            if (d.id.type !== 'Identifier') {
                return true;
            }
            if (!d.init) {
                return true;
            }
            const type = d.init.type;
            if (!lits.includes(type)) {
                return true;
            }
            return false;
        })) {
        return decl;
    }
}
