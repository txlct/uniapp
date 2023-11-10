import { Expression, Identifier, MemberExpression, SpreadElement } from '@babel/types';
import { ElementNode, ExpressionNode, SimpleExpressionNode, SourceLocation, TransformContext as VueTransformContext } from '@vue/compiler-core';
import { CodegenScope } from '../options';
import { TransformContext } from '../transform';
export declare const ATTR_VUE_ID = "u-i";
export declare const ATTR_VUE_SLOTS = "u-s";
export declare const ATTR_VUE_PROPS = "u-p";
export declare const ATTR_VUE_REF: string;
export declare const ATTR_VUE_REF_IN_FOR: string;
export declare const ATTR_COM_TYPE = "u-t";
export declare const SCOPED_SLOT_IDENTIFIER = "__SCOPED_SLOT__";
export declare const VIRTUAL_HOST_STYLE = "virtualHostStyle";
export declare const VIRTUAL_HOST_CLASS = "virtualHostClass";
export declare function rewriteSpreadElement(name: symbol, expr: SpreadElement, loc: SourceLocation, context: TransformContext): Identifier | MemberExpression | undefined;
export declare function rewirteWithHelper(name: symbol, expr: Expression, loc: SourceLocation, context: TransformContext): Identifier | MemberExpression | undefined;
export declare function parseExprWithRewrite(code: string, loc: SourceLocation, context: TransformContext, node?: Expression): Identifier | MemberExpression | undefined;
export declare function parseExprWithRewriteClass(code: string, loc: SourceLocation, context: TransformContext, node: Expression): Identifier | MemberExpression | undefined;
export declare function rewriteExpressionWithoutProperty(node: ExpressionNode, context: TransformContext, babelNode?: Expression, scope?: CodegenScope): SimpleExpressionNode;
export declare function rewriteExpression(node: ExpressionNode, context: TransformContext | VueTransformContext, babelNode?: Expression, scope?: CodegenScope, { property, ignoreLiteral, referencedScope, }?: {
    property: boolean;
    ignoreLiteral: boolean;
    referencedScope?: CodegenScope;
}): SimpleExpressionNode;
export declare function findReferencedScope(node: Expression, scope: CodegenScope, findReferenced?: boolean): CodegenScope;
export declare function isReferencedByIds(node: Expression, knownIds: string[]): boolean;
export declare function isStaticLiteral(value: object | null | undefined): boolean;
export declare function removeAttribute(node: ElementNode, name: string): void;
//# sourceMappingURL=utils.d.ts.map