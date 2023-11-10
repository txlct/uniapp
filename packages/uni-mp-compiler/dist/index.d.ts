import { CodegenResult, ParserOptions, RootNode } from '@vue/compiler-core';
import { CompilerOptions } from './options';
export { findProp } from '@vue/compiler-core';
export type { CompilerOptions, DirectiveNode, NodeTransform, DirectiveTransform, TransformContext, SimpleExpressionNode, } from '@vue/compiler-core';
export { genExpr } from './codegen';
export { rewriteExpression } from './transforms/utils';
export { isForElementNode } from './transforms/vFor';
export { transformOn } from './transforms/vOn';
export { transformModel } from './transforms/vModel';
export * from './runtimeHelpers';
export declare function parse(template: string, options?: ParserOptions): RootNode;
export declare function compile(template: string, options?: CompilerOptions): CodegenResult;
//# sourceMappingURL=index.d.ts.map