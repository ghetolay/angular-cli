import * as ts from 'typescript';
import * as fs from 'fs';
import { WebpackResourceLoader } from './resource_loader';
export interface OnErrorFn {
    (message: string): void;
}
export declare class VirtualStats implements fs.Stats {
    protected _path: string;
    protected _ctime: Date;
    protected _mtime: Date;
    protected _atime: Date;
    protected _btime: Date;
    protected _dev: number;
    protected _ino: number;
    protected _mode: number;
    protected _uid: any;
    protected _gid: any;
    constructor(_path: string);
    isFile(): boolean;
    isDirectory(): boolean;
    isBlockDevice(): boolean;
    isCharacterDevice(): boolean;
    isSymbolicLink(): boolean;
    isFIFO(): boolean;
    isSocket(): boolean;
    readonly dev: number;
    readonly ino: number;
    readonly mode: number;
    readonly nlink: number;
    readonly uid: any;
    readonly gid: any;
    readonly rdev: number;
    readonly size: number;
    readonly blksize: number;
    readonly blocks: number;
    readonly atime: Date;
    readonly mtime: Date;
    readonly ctime: Date;
    readonly birthtime: Date;
}
export declare class VirtualDirStats extends VirtualStats {
    constructor(_fileName: string);
    isDirectory(): boolean;
    readonly size: number;
}
export declare class VirtualFileStats extends VirtualStats {
    private _content;
    private _sourceFile;
    private _resources;
    constructor(_fileName: string, _content: string);
    content: string;
    sourceFile: ts.SourceFile;
    addResource(resourcePath: string): void;
    readonly resources: string[];
    isFile(): boolean;
    readonly size: number;
}
export declare class WebpackCompilerHost implements ts.CompilerHost {
    private _options;
    private _defaultTemplateType;
    private _defaultStyleType;
    private _delegate;
    private _files;
    private _directories;
    private _cachedResources;
    private _changedFiles;
    private _changedDirs;
    private _basePath;
    private _setParentNodes;
    private _cache;
    private _resourceLoader?;
    constructor(_options: ts.CompilerOptions, basePath: string, _defaultTemplateType?: string, _defaultStyleType?: string);
    private _normalizePath(path);
    resolve(path: string): string;
    private _setFileContent(fileName, content, resource?);
    readonly dirty: boolean;
    enableCaching(): void;
    resetChangedFileTracker(): void;
    getChangedFilePaths(): string[];
    getNgFactoryPaths(): string[];
    invalidate(fileName: string): void;
    /**
     * Return the corresponding component path
     * or undefined if path isn't considered a resource
     */
    private _getComponentPath(path);
    fileExists(fileName: string, delegate?: boolean): boolean;
    readFile(fileName: string): string;
    private _readResource(resourcePath, componentPath);
    stat(path: string): VirtualStats;
    directoryExists(directoryName: string, delegate?: boolean): boolean;
    getFiles(path: string): string[];
    getDirectories(path: string): string[];
    private _buildSourceFile(fileName, content, languageVersion);
    getSourceFile(fileName: string, languageVersion?: ts.ScriptTarget, _onError?: OnErrorFn): ts.SourceFile;
    getCancellationToken(): ts.CancellationToken;
    getDefaultLibFileName(options: ts.CompilerOptions): string;
    readonly writeFile: (fileName: string, data: string, _writeByteOrderMark: boolean, _onError?: (message: string) => void, _sourceFiles?: ts.SourceFile[]) => void;
    getCurrentDirectory(): string;
    getCanonicalFileName(fileName: string): string;
    useCaseSensitiveFileNames(): boolean;
    getNewLine(): string;
    setResourceLoader(resourceLoader: WebpackResourceLoader): void;
    readResource(fileName: string): string | Promise<string>;
}
