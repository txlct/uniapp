import type { UTSResult } from '@dcloudio/uts';
import { ToKotlinOptions } from './utils';
import { Module } from '../types/types';
export declare function createKotlinResolveTypeReferenceName(_namespace: string, _ast: Module): (name: string) => string;
export declare function runKotlinProd(filename: string, components: Record<string, string>): Promise<void>;
export type RunKotlinDevResult = UTSResult & {
    type: 'kotlin';
    changed: string[];
};
export declare function runKotlinDev(filename: string, components: Record<string, string>): Promise<RunKotlinDevResult | undefined>;
export declare function resolveAndroidDepFiles(filename: string): string[];
export declare function compile(filename: string, { inputDir, outputDir, sourceMap, components }: ToKotlinOptions): Promise<UTSResult | undefined>;
export declare function checkAndroidVersionTips(pluginId: string, pluginDir: string, is_uni_modules: boolean): string | undefined;
