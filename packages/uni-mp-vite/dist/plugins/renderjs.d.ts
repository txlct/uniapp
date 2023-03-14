import { Plugin, ResolvedConfig } from 'vite';
export declare function getFiltersCache(resolvedConfig: ResolvedConfig): MiniProgramFilterOptions[];
export declare function uniRenderjsPlugin({ lang }: {
    lang?: string;
}): Plugin;
