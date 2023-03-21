import { DirectiveNode, ElementNode, Property, RootNode, ParentNode, TemplateChildNode, CompilerError, ExpressionNode, JSChildNode, CacheExpression } from '@vue/compiler-core';
import { CodegenRootNode, CodegenRootScope, CodegenScope, CodegenVForScope, CodegenVForScopeInit, CodegenVIfScope, CodegenVIfScopeInit, TransformOptions } from './options';
export interface ImportItem {
    exp: string | ExpressionNode;
    path: string;
}
export type NodeTransform = (node: RootNode | TemplateChildNode, context: TransformContext) => void | (() => void) | (() => void)[];
export type DirectiveTransform = (dir: DirectiveNode, node: ElementNode, context: TransformContext, augmentor?: (ret: DirectiveTransformResult) => DirectiveTransformResult) => DirectiveTransformResult;
interface DirectiveTransformResult {
    props: Property[];
    needRuntime?: boolean | symbol;
}
export interface ErrorHandlingOptions {
    onWarn?: (warning: CompilerError) => void;
    onError?: (error: CompilerError) => void;
}
export declare const enum BindingComponentTypes {
    SELF = "self",
    SETUP = "setup",
    UNKNOWN = "unknown"
}
export interface TransformContext extends Required<Omit<TransformOptions, 'filename' | 'root'>> {
    selfName: string | null;
    currentNode: RootNode | TemplateChildNode | null;
    parent: ParentNode | null;
    childIndex: number;
    helpers: Map<symbol, number>;
    components: Set<string>;
    imports: ImportItem[];
    bindingComponents: Record<string, {
        type: BindingComponentTypes;
        name: string;
    }>;
    bindingComponentPlaceholder: Record<string, {
        type: BindingComponentTypes;
        name: string;
    }>;
    identifiers: {
        [name: string]: number | undefined;
    };
    cached: number;
    scopes: {
        vFor: number;
        vueId: number;
    };
    scope: CodegenRootScope;
    currentScope: CodegenScope;
    currentVueId: string;
    vueIds: string[];
    inVOnce: boolean;
    inVFor: boolean;
    helper<T extends symbol>(name: T): T;
    removeHelper<T extends symbol>(name: T): void;
    helperString(name: symbol): string;
    replaceNode(node: TemplateChildNode): void;
    removeNode(node?: TemplateChildNode): void;
    onNodeRemoved(): void;
    addIdentifiers(exp: ExpressionNode | string): void;
    removeIdentifiers(exp: ExpressionNode | string): void;
    popScope(): CodegenScope | undefined;
    getScopeIndex(scope: CodegenScope): number;
    addVIfScope(initScope: CodegenVIfScopeInit): CodegenVIfScope;
    addVForScope(initScope: CodegenVForScopeInit): CodegenVForScope;
    cache<T extends JSChildNode>(exp: T, isVNode?: boolean): CacheExpression | T;
    isMiniProgramComponent(name: string): 'plugin' | 'component' | 'dynamicLib' | undefined;
    rootNode: TemplateChildNode | null;
}
export declare function isRootScope(scope: CodegenScope): scope is CodegenRootScope;
export declare function isVIfScope(scope: CodegenScope): scope is CodegenVIfScope;
export declare function isVForScope(scope: CodegenScope): scope is CodegenVForScope;
export declare function isScopedSlotVFor({ source }: CodegenVForScope): boolean;
export declare function transform(root: CodegenRootNode, options: TransformOptions): TransformContext;
export declare function traverseNode(node: RootNode | TemplateChildNode, context: TransformContext): void;
export declare function traverseChildren(parent: ParentNode, context: TransformContext): void;
export declare function createTransformContext(rootNode: RootNode, { root, filename, isTS, inline, hashId, scopeId, filters, bindingCssVars, bindingMetadata, cacheHandlers, prefixIdentifiers, skipTransformIdentifier, renderDataSpread, nodeTransforms, directiveTransforms, miniProgram, isBuiltInComponent, isCustomElement, expressionPlugins, onError, onWarn, }: TransformOptions): TransformContext;
export declare type StructuralDirectiveTransform = (node: ElementNode, dir: DirectiveNode, context: TransformContext) => void | (() => void);
export declare function createStructuralDirectiveTransform(name: string | RegExp, fn: StructuralDirectiveTransform): NodeTransform;
export {};