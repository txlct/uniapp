import { generateCodeFrameWithKotlinStacktrace, generateCodeFrameWithSwiftStacktrace } from './legacy';
export declare const sourcemap: {
    generateCodeFrameWithKotlinStacktrace: typeof generateCodeFrameWithKotlinStacktrace;
    generateCodeFrameWithSwiftStacktrace: typeof generateCodeFrameWithSwiftStacktrace;
};
export * from './sourceMap';
export { compile as toKotlin } from './kotlin';
export { compile as toSwift } from './swift';
export interface CompileResult {
    code: string;
    deps: string[];
    encrypt: boolean;
    meta?: any;
}
export declare function compile(pluginDir: string): Promise<CompileResult | void>;
