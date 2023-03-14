"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCodeFrame = exports.parseUTSSwiftPluginStacktrace = void 0;
const sourceMap_1 = require("./sourceMap");
const splitRE = /\r?\n/;
const uniModulesSwiftUTSRe = /(.*)index.swift:([0-9]+):([0-9]+):\s+error:\s+(.*)/;
async function parseUTSSwiftPluginStacktrace({ stacktrace, sourceRoot, sourceMapFile, }) {
    const res = [];
    const lines = stacktrace.split(splitRE);
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const codes = await parseUTSStacktraceLine(line, uniModulesSwiftUTSRe, sourceMapFile, sourceRoot);
        if (codes && codes.length) {
            res.push(...codes);
        }
        else {
            res.push(line);
        }
    }
    return res.join('\n');
}
exports.parseUTSSwiftPluginStacktrace = parseUTSSwiftPluginStacktrace;
async function parseUTSStacktraceLine(lineStr, re, sourceMapFile, sourceRoot) {
    const uniModulesMatches = lineStr.match(re);
    if (!uniModulesMatches) {
        return;
    }
    const lines = [];
    const [, , line, column, message] = uniModulesMatches;
    const originalPosition = await (0, sourceMap_1.originalPositionFor)({
        sourceMapFile,
        line: parseInt(line),
        column: parseInt(column),
        withSourceContent: true,
    });
    if (originalPosition.source && originalPosition.sourceContent) {
        lines.push(`${message}`);
        lines.push(`at ${originalPosition.source}:${originalPosition.line}:${originalPosition.column}`);
        if (originalPosition.line !== null && originalPosition.column !== null) {
            lines.push(generateCodeFrame(originalPosition.sourceContent, {
                line: originalPosition.line,
                column: originalPosition.column,
            }).replace(/\t/g, ' '));
        }
    }
    else {
        lines.push(lineStr);
    }
    return lines;
}
const range = 2;
function posToNumber(source, pos) {
    if (typeof pos === 'number')
        return pos;
    const lines = source.split(splitRE);
    const { line, column } = pos;
    let start = 0;
    for (let i = 0; i < line - 1; i++) {
        start += lines[i].length + 1;
    }
    return start + column;
}
function generateCodeFrame(source, start = 0, end) {
    start = posToNumber(source, start);
    end = end || start;
    const lines = source.split(splitRE);
    let count = 0;
    const res = [];
    for (let i = 0; i < lines.length; i++) {
        count += lines[i].length + 1;
        if (count >= start) {
            for (let j = i - range; j <= i + range || end > count; j++) {
                if (j < 0 || j >= lines.length)
                    continue;
                const line = j + 1;
                res.push(`${line}${' '.repeat(Math.max(3 - String(line).length, 0))}|  ${lines[j]}`);
                const lineLength = lines[j].length;
                if (j === i) {
                    // push underline
                    const pad = start - (count - lineLength) + 1;
                    const length = Math.max(1, end > count ? lineLength - pad : end - start);
                    res.push(`   |  ` + ' '.repeat(pad) + '^'.repeat(length));
                }
                else if (j > i) {
                    if (end > count) {
                        const length = Math.max(Math.min(end - count, lineLength), 1);
                        res.push(`   |  ` + '^'.repeat(length));
                    }
                    count += lineLength + 1;
                }
            }
            break;
        }
    }
    return res.join('\n');
}
exports.generateCodeFrame = generateCodeFrame;
