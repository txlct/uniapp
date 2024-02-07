export { default as hash } from 'hash-sum';
import { ElementNode, RootNode, TemplateChildNode } from '@vue/compiler-core';
import { ParserPlugin } from '@babel/parser';
export declare const version: any;
export declare let isRunningWithYarnPnp: boolean;
export declare const isWindows: boolean;
export declare function normalizePath(id: string): string;
export declare function checkElementNodeTag(node: RootNode | TemplateChildNode | null | undefined, tag: string): node is ElementNode;
export declare function normalizeIdentifier(str: string): string;
export declare function normalizePagePath(pagePath: string, platform: UniApp.PLATFORM): string | undefined;
export declare function removeExt(str: string): string;
export declare function normalizeNodeModules(str: string): string;
export declare function normalizeMiniProgramFilename(filename: string, inputDir?: string): string;
export declare function normalizeParsePlugins(importer: string, babelParserPlugins?: ParserPlugin[]): (import("@babel/parser").ParserPluginWithOptions | ("asyncDoExpressions" | "asyncGenerators" | "bigInt" | "classPrivateMethods" | "classPrivateProperties" | "classProperties" | "classStaticBlock" | "decimal" | "decorators-legacy" | "decoratorAutoAccessors" | "destructuringPrivate" | "doExpressions" | "dynamicImport" | "explicitResourceManagement" | "exportDefaultFrom" | "exportNamespaceFrom" | "flow" | "flowComments" | "functionBind" | "functionSent" | "importMeta" | "jsx" | "logicalAssignment" | "importAssertions" | "importReflection" | "moduleBlocks" | "moduleStringNames" | "nullishCoalescingOperator" | "numericSeparator" | "objectRestSpread" | "optionalCatchBinding" | "optionalChaining" | "partialApplication" | "placeholders" | "privateIn" | "regexpUnicodeSets" | "throwExpressions" | "topLevelAwait" | "v8intrinsic" | "decorators" | "estree" | "moduleAttributes" | "pipelineOperator" | "recordAndTuple" | "typescript"))[];
export declare function pathToGlob(pathString: string, glob: string, options?: {
    windows?: boolean;
    escape?: boolean;
}): string;
export declare function resolveSourceMapPath(outputDir?: string, platform?: UniApp.PLATFORM): string;
export declare function installDepTips(type: 'dependencies' | 'devDependencies', module: string, version?: string): string;
//# sourceMappingURL=utils.d.ts.map