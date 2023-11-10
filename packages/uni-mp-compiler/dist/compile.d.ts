import { CodegenRootNode, CompilerOptions } from './options';
import { DirectiveTransform, NodeTransform } from './transform';
export type TransformPreset = [
    NodeTransform[],
    Record<string, DirectiveTransform>
];
export declare function getBaseTransformPreset({ prefixIdentifiers, skipTransformIdentifier, }: {
    prefixIdentifiers: boolean;
    skipTransformIdentifier: boolean;
}): TransformPreset;
export declare function baseCompile(template: string, options?: CompilerOptions): Omit<import("@vue/compiler-core").CodegenResult, "ast"> & {
    ast: CodegenRootNode;
};
//# sourceMappingURL=compile.d.ts.map