export declare const BUILT_IN_TAG_NAMES: string[];
export declare const BUILT_IN_TAGS: string[];
export declare const TAGS: string[];
export declare const NVUE_BUILT_IN_TAGS: string[];
export declare const NVUE_U_BUILT_IN_TAGS: string[];
export declare function isBuiltInComponent(tag: string): boolean;
export declare function isH5CustomElement(tag: string): boolean;
export declare function isH5NativeTag(tag: string): boolean;
export declare function isAppNativeTag(tag: string): boolean;
export declare function isAppNVueNativeTag(tag: string): boolean;
export declare function isMiniProgramNativeTag(tag: string): boolean;
export declare function createIsCustomElement(tags?: string[]): (tag: string) => boolean;
export declare function isComponentTag(tag: string): boolean;
export declare const COMPONENT_SELECTOR_PREFIX = "uni-";
export declare const COMPONENT_PREFIX: string;