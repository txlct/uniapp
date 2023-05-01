interface ParseUTSPluginStacktraceOptions {
    stacktrace: string;
    sourceRoot: string;
    sourceMapFile: string;
}
export declare function parseUTSSwiftPluginStacktrace({ stacktrace, sourceRoot, sourceMapFile, }: ParseUTSPluginStacktraceOptions): Promise<string>;
export declare function generateCodeFrame(source: string, start?: number | {
    line: number;
    column: number;
}, end?: number): string;
export {};
