import { BasicSourceMapConsumer, IndexedSourceMapConsumer } from 'source-map';
interface MessageSourceLocation {
    type: 'exception' | 'error' | 'warning' | 'info' | 'logging' | 'output';
    message: string;
    file?: string;
    line: number;
    column: number;
    code?: string;
}
interface GenerateCodeFrameOptions {
    sourceRoot?: string;
    replaceTabsWithSpace?: boolean;
}
export declare function generateCodeFrameSourceMapConsumer(consumer: BasicSourceMapConsumer | IndexedSourceMapConsumer, m: MessageSourceLocation, options?: GenerateCodeFrameOptions): Required<MessageSourceLocation> | undefined;
export declare function generateCodeFrameWithSourceMapPath(filename: string, messages: MessageSourceLocation[] | string, options?: GenerateCodeFrameOptions): Promise<Required<MessageSourceLocation>[]>;
interface GenerateCodeFrameWithStacktraceOptions {
    name: string;
    inputDir: string;
    outputDir: string;
}
export declare function generateCodeFrameWithKotlinStacktrace(stacktrace: string, { name, inputDir, outputDir }: GenerateCodeFrameWithStacktraceOptions): Promise<unknown>;
export declare function generateCodeFrameWithSwiftStacktrace(stacktrace: string, { name, inputDir, outputDir }: GenerateCodeFrameWithStacktraceOptions): Promise<unknown>;
export {};
