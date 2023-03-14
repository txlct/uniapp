import { ToSwiftOptions } from './utils';
import { UTSResult } from '@dcloudio/uts';
export declare function runSwiftProd(filename: string, components: Record<string, string>): Promise<void>;
export type RunSwiftDevResult = UTSResult & {
    type: 'swift';
    code: number;
    msg: string;
    changed: string[];
};
export declare function runSwiftDev(filename: string, components: Record<string, string>): Promise<RunSwiftDevResult | undefined>;
export declare function compile(filename: string, { inputDir, outputDir, sourceMap, components }: ToSwiftOptions): Promise<UTSResult | undefined>;
export declare function resolveIOSDepFiles(filename: string): string[];
export declare function checkIOSVersionTips(pluginId: string, pluginDir: string, is_uni_modules: boolean): string | undefined;
