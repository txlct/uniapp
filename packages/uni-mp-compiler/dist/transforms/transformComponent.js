"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rewritePropsBinding = exports.isPropsBinding = exports.rewriteBinding = exports.transformComponent = void 0;
const shared_1 = require("@vue/shared");
const compiler_core_1 = require("@vue/compiler-core");
const uni_cli_shared_1 = require("@dcloudio/uni-cli-shared");
const transform_1 = require("../transform");
const utils_1 = require("./utils");
const codegen_1 = require("../codegen");
const types_1 = require("@babel/types");
const runtimeHelpers_1 = require("../runtimeHelpers");
const ast_1 = require("../ast");
const vIf_1 = require("./vIf");
const transformComponent = (node, context) => {
    if (!(0, uni_cli_shared_1.isUserComponent)(node, context)) {
        return;
    }
    addComponentType(node, context);
    addVueId(node, context);
    processBooleanAttr(node);
    return function postTransformComponent() {
        context.vueIds.pop();
    };
};
exports.transformComponent = transformComponent;
function addComponentType(node, context) {
    if (!context.isMiniProgramComponent(node.tag)) {
        return;
    }
    node.props.push((0, uni_cli_shared_1.createAttributeNode)(utils_1.ATTR_COM_TYPE, 'm'));
}
function addVueId(node, context) {
    let { hashId, scopes, currentScope, currentVueId } = context;
    if (!hashId) {
        return;
    }
    let vueId = hashId + '-' + scopes.vueId++;
    const indexs = [];
    while (currentScope) {
        if ((0, transform_1.isVForScope)(currentScope)) {
            indexs.push(`+'-'+${currentScope.indexAlias}`);
        }
        currentScope = currentScope.parent;
    }
    const inFor = !!indexs.length;
    if (inFor) {
        vueId = `'${vueId}'` + indexs.reverse().join('');
    }
    context.vueIds.push(vueId);
    let value = vueId;
    if (currentVueId) {
        const isParentDynamic = currentVueId.includes('+');
        const isCurrentDynamic = vueId.includes('+');
        if (isParentDynamic || isCurrentDynamic) {
            value = `(${vueId})+','+(${isParentDynamic ? currentVueId : `'${currentVueId}'`})`;
        }
        else {
            value = vueId + ',' + currentVueId;
        }
    }
    if (value.includes('+')) {
        return node.props.push((0, uni_cli_shared_1.createBindDirectiveNode)(utils_1.ATTR_VUE_ID, value));
    }
    return node.props.push((0, uni_cli_shared_1.createAttributeNode)(utils_1.ATTR_VUE_ID, value));
}
/**
 * <uni-collapse accordion/> => <uni-collapse :accordion="true"/>
 * 否则部分平台(快手)可能获取到的 accordion 是空字符串
 * @param param0
 */
function processBooleanAttr({ props }) {
    props.forEach((prop, index) => {
        if (prop.type === 6 /* NodeTypes.ATTRIBUTE */ &&
            typeof prop.value === 'undefined') {
            props.splice(index, 1, (0, uni_cli_shared_1.createBindDirectiveNode)(prop.name, 'true'));
        }
    });
}
const builtInProps = [
    // 'id',
    'class',
    'style',
    utils_1.ATTR_VUE_ID,
    utils_1.ATTR_VUE_PROPS,
    utils_1.ATTR_VUE_SLOTS,
    utils_1.ATTR_VUE_REF,
    utils_1.ATTR_VUE_REF_IN_FOR,
    utils_1.ATTR_COM_TYPE,
    'eO',
    'e-o',
    'onVI',
    'ref',
    'slot',
    'key',
    'is',
];
function isComponentProp(name) {
    if (builtInProps.includes(name)) {
        return false;
    }
    if (name.startsWith('data-')) {
        return false;
    }
    return true;
}
/**
 * 重写组件 props 绑定
 * @param node
 * @param context
 */
function rewriteBinding({ tag, props }, context) {
    const isMiniProgramComponent = context.isMiniProgramComponent(tag);
    if (isMiniProgramComponent === 'plugin' ||
        isMiniProgramComponent === 'dynamicLib') {
        // 因无法介入插件类型组件内部实现，故保留原始属性
        return;
    }
    const createObjectProperty = isMiniProgramComponent
        ? (name, value) => (0, types_1.objectProperty)((0, types_1.identifier)((0, shared_1.camelize)(name)), value)
        : (name, value) => {
            const computed = !(0, compiler_core_1.isSimpleIdentifier)(name);
            return (0, types_1.objectProperty)(computed ? (0, types_1.stringLiteral)(name) : (0, types_1.identifier)(name), value, computed);
        };
    const properties = [];
    for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        let isIdProp = false;
        if ((0, uni_cli_shared_1.isAttributeNode)(prop)) {
            const { name } = prop;
            isIdProp = name === 'id';
            if (!isComponentProp(name)) {
                continue;
            }
            properties.push(createObjectProperty(name, (0, types_1.stringLiteral)(prop.value?.content || '')));
        }
        else if ((0, uni_cli_shared_1.isDirectiveNode)(prop)) {
            if (prop.name !== 'bind') {
                continue;
            }
            const { arg, exp } = prop;
            if (!exp) {
                continue;
            }
            if (!arg) {
                const spreadElement = createVBindSpreadElement(prop, context);
                if (spreadElement) {
                    properties.push(spreadElement);
                }
            }
            else if ((0, compiler_core_1.isStaticExp)(arg)) {
                isIdProp = arg.content === 'id';
                if (!isComponentProp(arg.content)) {
                    continue;
                }
                // :name="name"
                const valueExpr = (0, ast_1.parseExpr)((0, codegen_1.genExpr)(exp), context, exp);
                if (!valueExpr) {
                    continue;
                }
                properties.push(createObjectProperty(arg.content, valueExpr));
            }
            else {
                // :[dynamic]="dynamic"
                const leftExpr = (0, ast_1.parseExpr)((0, codegen_1.genExpr)(arg), context, exp);
                if (!leftExpr) {
                    continue;
                }
                const valueExpr = (0, ast_1.parseExpr)((0, codegen_1.genExpr)(exp), context, exp);
                if (!valueExpr) {
                    continue;
                }
                properties.push((0, types_1.objectProperty)((0, types_1.logicalExpression)('||', leftExpr, (0, types_1.stringLiteral)('')), valueExpr, true));
            }
        }
        // 即保留 id 属性，又补充到 props 中
        if (!isIdProp) {
            props.splice(i, 1);
            i--;
        }
    }
    if (properties.length) {
        props.push((0, uni_cli_shared_1.createBindDirectiveNode)(utils_1.ATTR_VUE_PROPS, (0, codegen_1.genBabelExpr)((0, types_1.objectExpression)(properties))));
    }
}
exports.rewriteBinding = rewriteBinding;
function createVBindSpreadElement(prop, context) {
    const { arg, exp } = prop;
    if (!exp) {
        return;
    }
    if (!arg) {
        const argument = (0, ast_1.parseExpr)((0, codegen_1.genExpr)(exp), context, exp);
        if (!argument) {
            return;
        }
        return (0, types_1.spreadElement)(argument);
    }
}
function isPropsBinding({ arg }) {
    return (arg &&
        arg.type === 4 /* NodeTypes.SIMPLE_EXPRESSION */ &&
        arg.content === utils_1.ATTR_VUE_PROPS);
}
exports.isPropsBinding = isPropsBinding;
function rewritePropsBinding(dir, node, context) {
    dir.exp = (0, compiler_core_1.createSimpleExpression)((0, codegen_1.genBabelExpr)((0, utils_1.rewirteWithHelper)(runtimeHelpers_1.RENDER_PROPS, (0, ast_1.parseExpr)(dir.exp, context), dir.loc, context)) + ((0, vIf_1.isIfElementNode)(node) && node.vIf.name === 'else' ? `||''` : ''));
}
exports.rewritePropsBinding = rewritePropsBinding;