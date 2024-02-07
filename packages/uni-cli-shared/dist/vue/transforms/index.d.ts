export * from './transformRef';
export * from './transformPageHead';
export * from './transformComponent';
export * from './transformEvent';
export * from './transformTag';
export { createAssetUrlTransformWithOptions } from './templateTransformAssetUrl';
export { createSrcsetTransformWithOptions } from './templateTransformSrcset';
export { STRINGIFY_JSON, ATTR_DATASET_EVENT_OPTS, createTransformOn, defaultMatch as matchTransformOn, } from './vOn';
export { createTransformModel, defaultMatch as matchTransformModel, } from './vModel';
export declare const transformH5BuiltInComponents: import("@vue/compiler-core").NodeTransform;
export declare const transformMatchMedia: import("@vue/compiler-core").NodeTransform;
export declare const transformTapToClick: import("@vue/compiler-core").NodeTransform;
export declare const transformComponentLink: (node: import("@vue/compiler-core").RootNode | import("@vue/compiler-core").TemplateChildNode, context: import("@vue/compiler-core").TransformContext) => void;
//# sourceMappingURL=index.d.ts.map