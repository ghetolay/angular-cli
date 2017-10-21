"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const path_1 = require("path");
const refactor_1 = require("./refactor");
const MagicString = require('magic-string');
const dev = Math.floor(Math.random() * 10000);
// partial copy of TypeScriptFileRefactor
class InlineResourceRefactor {
    constructor(content, _sourceFile) {
        this._sourceFile = _sourceFile;
        this._changed = false;
        this.findAstNodes = refactor_1.TypeScriptFileRefactor.prototype.findAstNodes;
        this.replaceNode = refactor_1.TypeScriptFileRefactor.prototype.replaceNode;
        this._sourceString = new MagicString(content);
    }
    getResourcesNodes() {
        return this.findAstNodes(this._sourceFile, ts.SyntaxKind.ObjectLiteralExpression, true)
            .map(node => this.findAstNodes(node, ts.SyntaxKind.PropertyAssignment))
            .filter(node => !!node)
            .reduce((prev, curr) => prev.concat(curr
            .filter(node => node.name.kind == ts.SyntaxKind.Identifier ||
            node.name.kind == ts.SyntaxKind.StringLiteral)), []);
    }
    getResourceContentAndType(_content, defaultType) {
        let type = defaultType;
        const content = _content
            .replace(/!(\w*)!/, (_, _type) => {
            type = _type;
            return '';
        });
        return { content, type };
    }
    get hasChanged() {
        return this._changed;
    }
    getNewContent() {
        return this._sourceString.toString();
    }
}
class VirtualStats {
    constructor(_path) {
        this._path = _path;
        this._ctime = new Date();
        this._mtime = new Date();
        this._atime = new Date();
        this._btime = new Date();
        this._dev = dev;
        this._ino = Math.floor(Math.random() * 100000);
        this._mode = parseInt('777', 8); // RWX for everyone.
        this._uid = process.env['UID'] || 0;
        this._gid = process.env['GID'] || 0;
    }
    isFile() { return false; }
    isDirectory() { return false; }
    isBlockDevice() { return false; }
    isCharacterDevice() { return false; }
    isSymbolicLink() { return false; }
    isFIFO() { return false; }
    isSocket() { return false; }
    get dev() { return this._dev; }
    get ino() { return this._ino; }
    get mode() { return this._mode; }
    get nlink() { return 1; } // Default to 1 hard link.
    get uid() { return this._uid; }
    get gid() { return this._gid; }
    get rdev() { return 0; }
    get size() { return 0; }
    get blksize() { return 512; }
    get blocks() { return Math.ceil(this.size / this.blksize); }
    get atime() { return this._atime; }
    get mtime() { return this._mtime; }
    get ctime() { return this._ctime; }
    get birthtime() { return this._btime; }
}
exports.VirtualStats = VirtualStats;
class VirtualDirStats extends VirtualStats {
    constructor(_fileName) {
        super(_fileName);
    }
    isDirectory() { return true; }
    get size() { return 1024; }
}
exports.VirtualDirStats = VirtualDirStats;
class VirtualFileStats extends VirtualStats {
    constructor(_fileName, _content) {
        super(_fileName);
        this._content = _content;
        this._resources = [];
    }
    get content() { return this._content; }
    set content(v) {
        this._content = v;
        this._mtime = new Date();
        this._sourceFile = null;
    }
    set sourceFile(sourceFile) {
        this._sourceFile = sourceFile;
    }
    get sourceFile() {
        return this._sourceFile;
    }
    addResource(resourcePath) {
        this._resources.push(resourcePath);
    }
    get resources() { return this._resources; }
    isFile() { return true; }
    get size() { return this._content.length; }
}
exports.VirtualFileStats = VirtualFileStats;
class WebpackCompilerHost {
    constructor(_options, basePath, _defaultTemplateType = 'html', _defaultStyleType = 'css') {
        this._options = _options;
        this._defaultTemplateType = _defaultTemplateType;
        this._defaultStyleType = _defaultStyleType;
        this._files = Object.create(null);
        this._directories = Object.create(null);
        this._cachedResources = Object.create(null);
        this._changedFiles = Object.create(null);
        this._changedDirs = Object.create(null);
        this._cache = false;
        this._setParentNodes = true;
        this._delegate = ts.createCompilerHost(this._options, this._setParentNodes);
        this._basePath = this._normalizePath(basePath);
    }
    _normalizePath(path) {
        return path.replace(/\\/g, '/');
    }
    resolve(path) {
        path = this._normalizePath(path);
        if (path[0] == '.') {
            return this._normalizePath(path_1.join(this.getCurrentDirectory(), path));
        }
        else if (path[0] == '/' || path.match(/^\w:\//)) {
            return path;
        }
        else {
            return this._normalizePath(path_1.join(this._basePath, path));
        }
    }
    _setFileContent(fileName, content, resource) {
        this._files[fileName] = new VirtualFileStats(fileName, content);
        let p = path_1.dirname(fileName);
        while (p && !this._directories[p]) {
            this._directories[p] = new VirtualDirStats(p);
            this._changedDirs[p] = true;
            p = path_1.dirname(p);
        }
        // only ts files are expected on getChangedFiles()
        if (!resource) {
            this._changedFiles[fileName] = true;
        }
    }
    get dirty() {
        return Object.keys(this._changedFiles).length > 0;
    }
    enableCaching() {
        this._cache = true;
    }
    resetChangedFileTracker() {
        this._changedFiles = Object.create(null);
        this._changedDirs = Object.create(null);
    }
    getChangedFilePaths() {
        return Object.keys(this._changedFiles);
    }
    getNgFactoryPaths() {
        return Object.keys(this._files)
            .filter(fileName => fileName.endsWith('.ngfactory.js') || fileName.endsWith('.ngstyle.js'));
    }
    invalidate(fileName) {
        fileName = this.resolve(fileName);
        const file = this._files[fileName];
        if (file != null) {
            file.resources
                .forEach(r => this.invalidate(r));
            this._files[fileName] = null;
        }
        if (fileName in this._changedFiles) {
            this._changedFiles[fileName] = true;
        }
    }
    /**
     * Return the corresponding component path
     * or undefined if path isn't considered a resource
     */
    _getComponentPath(path) {
        const match = path.match(
        // match ngtemplate, ngstyles but not shim nor summaries
        /(.*)\.(?:ngtemplate|(?:ngstyles[\d]*))(?!.*(?:shim.ngstyle.ts|ngsummary.json)$).*$/);
        if (match != null) {
            return match[1] + '.ts';
        }
    }
    fileExists(fileName, delegate = true) {
        fileName = this.resolve(fileName);
        if (this._files[fileName] != null) {
            return true;
        }
        const componentPath = this._getComponentPath(fileName);
        if (componentPath != null) {
            return this._files[componentPath] == null &&
                this._readResource(fileName, componentPath) != null;
        }
        else {
            if (delegate) {
                return this._delegate.fileExists(fileName);
            }
        }
        return false;
    }
    readFile(fileName) {
        fileName = this.resolve(fileName);
        const stats = this._files[fileName];
        if (stats == null) {
            const componentPath = this._getComponentPath(fileName);
            if (componentPath != null) {
                return this._readResource(fileName, componentPath);
            }
            const result = this._delegate.readFile(fileName);
            if (result !== undefined && this._cache) {
                this._setFileContent(fileName, result);
            }
            return result;
        }
        return stats.content;
    }
    _readResource(resourcePath, componentPath) {
        // Trigger source file build which will create and cache associated resources
        this.getSourceFile(componentPath);
        const stats = this._files[resourcePath];
        if (stats != null) {
            return stats.content;
        }
    }
    // Does not delegate, use with `fileExists/directoryExists()`.
    stat(path) {
        path = this.resolve(path);
        return this._files[path] || this._directories[path];
    }
    directoryExists(directoryName, delegate = true) {
        directoryName = this.resolve(directoryName);
        return (this._directories[directoryName] != null)
            || (delegate
                && this._delegate.directoryExists != undefined
                && this._delegate.directoryExists(directoryName));
    }
    getFiles(path) {
        path = this.resolve(path);
        return Object.keys(this._files)
            .filter(fileName => path_1.dirname(fileName) == path)
            .map(path => path_1.basename(path));
    }
    getDirectories(path) {
        path = this.resolve(path);
        const subdirs = Object.keys(this._directories)
            .filter(fileName => path_1.dirname(fileName) == path)
            .map(path => path_1.basename(path));
        let delegated;
        try {
            delegated = this._delegate.getDirectories(path);
        }
        catch (e) {
            delegated = [];
        }
        return delegated.concat(subdirs);
    }
    _buildSourceFile(fileName, content, languageVersion) {
        let sourceFile = ts.createSourceFile(fileName, content, languageVersion, this._setParentNodes);
        const refactor = new InlineResourceRefactor(content, sourceFile);
        const prefix = fileName.substring(0, fileName.lastIndexOf('.'));
        const resources = [];
        refactor.getResourcesNodes()
            .forEach((node) => {
            const name = node.name.text;
            if (name === 'template') {
                const { content, type } = refactor.getResourceContentAndType(node.initializer.text, this._defaultTemplateType);
                const path = `${prefix}.ngtemplate.${type}`;
                // always cache resources
                this._setFileContent(path, content, true);
                resources.push(path);
                refactor.replaceNode(node, `templateUrl: './${path_1.basename(path)}'`);
            }
            else {
                if (name === 'styles') {
                    const arr = refactor.findAstNodes(node, ts.SyntaxKind.ArrayLiteralExpression, false);
                    if (arr && arr.length > 0 && arr[0].elements.length > 0) {
                        const styles = arr[0].elements
                            .map((element) => element.text)
                            .map((_content, idx) => {
                            const { content, type } = refactor.getResourceContentAndType(_content, this._defaultStyleType);
                            return { path: `${prefix}.ngstyles${idx}.${type}`, content };
                        });
                        styles.forEach(({ path, content }) => {
                            // always cache resources
                            this._setFileContent(path, content, true);
                            resources.push(path);
                        });
                        const styleUrls = styles
                            .map(({ path }) => `'./${path_1.basename(path)}'`)
                            .join(',');
                        refactor.replaceNode(node, `styleUrls: [${styleUrls}]`);
                    }
                }
            }
        });
        if (refactor.hasChanged) {
            sourceFile = ts.createSourceFile(fileName, refactor.getNewContent(), languageVersion, this._setParentNodes);
        }
        return {
            sourceFile,
            resources
        };
    }
    getSourceFile(fileName, languageVersion = ts.ScriptTarget.Latest, _onError) {
        fileName = this.resolve(fileName);
        const stats = this._files[fileName];
        if (stats != null && stats.sourceFile != null) {
            return stats.sourceFile;
        }
        const content = this.readFile(fileName);
        if (!content) {
            return;
        }
        const { sourceFile, resources } = this._buildSourceFile(fileName, content, languageVersion);
        if (this._cache) {
            const stats = this._files[fileName];
            stats.sourceFile = sourceFile;
            resources.forEach(r => stats.addResource(r));
        }
        return sourceFile;
    }
    getCancellationToken() {
        return this._delegate.getCancellationToken();
    }
    getDefaultLibFileName(options) {
        return this._delegate.getDefaultLibFileName(options);
    }
    // This is due to typescript CompilerHost interface being weird on writeFile. This shuts down
    // typings in WebStorm.
    get writeFile() {
        return (fileName, data, _writeByteOrderMark, _onError, _sourceFiles) => {
            fileName = this.resolve(fileName);
            this._setFileContent(fileName, data);
        };
    }
    getCurrentDirectory() {
        return this._basePath !== null ? this._basePath : this._delegate.getCurrentDirectory();
    }
    getCanonicalFileName(fileName) {
        fileName = this.resolve(fileName);
        return this._delegate.getCanonicalFileName(fileName);
    }
    useCaseSensitiveFileNames() {
        return this._delegate.useCaseSensitiveFileNames();
    }
    getNewLine() {
        return this._delegate.getNewLine();
    }
    setResourceLoader(resourceLoader) {
        this._resourceLoader = resourceLoader;
    }
    // this function and resourceLoader is pretty new and seem unusued so I ignored it for the moment.
    readResource(fileName) {
        if (this._resourceLoader) {
            const denormalizedFileName = fileName.replace(/\//g, path_1.sep);
            const resourceDeps = this._resourceLoader.getResourceDependencies(denormalizedFileName);
            if (this._cachedResources[fileName] === undefined
                || resourceDeps.some((dep) => this._changedFiles[this.resolve(dep)])) {
                return this._resourceLoader.get(denormalizedFileName)
                    .then((resource) => {
                    // Add resource dependencies to the compiler host file list.
                    // This way we can check the changed files list to determine whether to use cache.
                    this._resourceLoader.getResourceDependencies(denormalizedFileName)
                        .forEach((dep) => this.readFile(dep));
                    this._cachedResources[fileName] = resource;
                    return resource;
                });
            }
            else {
                return this._cachedResources[fileName];
            }
        }
        else {
            return this.readFile(fileName);
        }
    }
}
exports.WebpackCompilerHost = WebpackCompilerHost;
//# sourceMappingURL=/home/ghetolay/git/angular-cli/src/compiler_host.js.map