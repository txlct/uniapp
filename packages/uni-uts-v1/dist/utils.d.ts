import type { parse, bundle, UTSTarget } from '@dcloudio/uts';
import { Module } from '../types/types';
interface ToOptions {
    inputDir: string;
    outputDir: string;
    sourceMap: boolean;
    components: Record<string, string>;
}
export type ToKotlinOptions = ToOptions;
export type ToSwiftOptions = ToOptions;
export declare const ERR_MSG_PLACEHOLDER = "___ERR_MSG___";
export declare function resolveUTSSourceMapPath(): string;
export declare function getUTSCompiler(): {
    parse: typeof parse;
    bundle: typeof bundle;
    UTSTarget: typeof UTSTarget;
};
export declare function resolvePackage(filename: string): {
    id: string;
    name: string;
    namespace: string;
    is_uni_modules: boolean;
    extname: string;
} | undefined;
export interface UTSPlatformResourceOptions {
    inputDir: string;
    outputDir: string;
    platform: typeof process.env.UNI_UTS_PLATFORM;
    extname: '.kt' | '.swift';
    components: Record<string, string>;
    package: string;
}
export declare function genUTSPlatformResource(filename: string, options: UTSPlatformResourceOptions): void;
export declare function moveRootIndexSourceMap(filename: string, { inputDir, platform, extname }: UTSPlatformResourceOptions): void;
export declare function isRootIndex(filename: string, platform: typeof process.env.UNI_UTS_PLATFORM): boolean;
export declare function resolveAndroidDir(filename: string): string;
export declare function resolveIOSDir(filename: string): string;
export declare function resolveUTSPlatformFile(filename: string, { inputDir, outputDir, platform, extname }: UTSPlatformResourceOptions): string;
export declare function createResolveTypeReferenceName(namespace: string, ast: Module): (name: string) => string;
export type CompilerServer = {};
export declare function getCompilerServer<T extends CompilerServer>(pluginName: 'uts-development-ios' | 'uniapp-runextension'): T | undefined;
export declare function resolveAndroidComponents(pluginDir: string, is_uni_modules: boolean): Record<string, string>;
export declare function resolveIOSComponents(pluginDir: string, is_uni_modules: boolean): Record<string, string>;
export declare function genComponentsCode(filename: string, components: Record<string, string>): string;
export declare function genConfigJson(platform: 'app-android' | 'app-ios', components: Record<string, string>, pluginRelativeDir: string, is_uni_modules: boolean, inputDir: string, outputDir: string): void;
export declare function parseKotlinPackageWithPluginId(id: string, is_uni_modules: boolean): string;
export declare function parseSwiftPackageWithPluginId(id: string, is_uni_modules: boolean): string;
export declare function isColorSupported(): boolean;
export {};
