import { NullableMappedPosition, NullablePosition } from 'source-map';
export declare function resolveUTSPluginSourceMapFile(target: 'kotlin' | 'swift', filename: string, inputDir: string, outputDir: string): string;
export declare const resolveUtsPluginSourceMapFile: typeof resolveUTSPluginSourceMapFile;
interface PositionFor {
    sourceMapFile: string;
    filename: string;
    line: number;
    column: number;
    withSourceContent?: boolean;
}
/**
 * 根据源码文件名、行号、列号，返回生成后文件、行号、列号（根据 uts 文件返回 kt|swift 文件）
 * @param originalPosition
 * @returns
 */
export declare function generatedPositionFor({ sourceMapFile, filename, line, column, outputDir, }: PositionFor & {
    outputDir?: string;
}): Promise<NullablePosition & {
    source: string | null;
}>;
/**
 * 根据生成后的文件名、行号、列号，返回源码文件、行号、列号（根据 kt|swift 文件返回 uts 文件）
 * @param generatedPosition
 * @returns
 */
export declare function originalPositionFor(generatedPosition: Omit<PositionFor, 'filename'> & {
    inputDir?: string;
}): Promise<NullableMappedPosition & {
    sourceContent?: string;
}>;
export {};
