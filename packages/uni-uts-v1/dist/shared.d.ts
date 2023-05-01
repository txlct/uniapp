export declare function parseJson(jsonStr: string): any;
export declare function once<T extends (...args: any[]) => any>(fn: T, ctx?: unknown): T;
export declare const runByHBuilderX: () => boolean;
export declare const isInHBuilderX: () => boolean;
export declare function resolveSourceMapPath(outputDir?: string, platform?: UniApp.PLATFORM): string;
export declare const isWindows: boolean;
export declare function normalizePath(id: string): string;
export declare function installHBuilderXPlugin(plugin: string): void;
