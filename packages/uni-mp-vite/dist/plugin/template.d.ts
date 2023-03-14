import { EmittedFile, GetModuleInfo } from 'rollup';
import { ResolvedConfig } from 'vite';
import { UniMiniProgramPluginOptions } from '.';
export declare function getFilterFiles(resolvedConfig: ResolvedConfig, getModuleInfo: GetModuleInfo): Record<string, MiniProgramFilterOptions>;
export declare function getTemplateFiles(template: UniMiniProgramPluginOptions['template']): any;
export declare const emitFile: (emittedFile: EmittedFile) => string;
