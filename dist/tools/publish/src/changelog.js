"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const cl = require('conventional-changelog');
const exec = require('child_process').exec;
const changelogStream = fs.createWriteStream('CHANGELOG-delta.md');
const config = {
    preset: 'angular',
    releaseCount: 1
};
function prependDelta() {
    return exec('cat CHANGELOG-delta.md CHANGELOG.md > CHANGELOG-new.md &&' +
        'mv CHANGELOG-new.md CHANGELOG.md &&' +
        'rm CHANGELOG-delta.md');
}
function changelog(args, _opts, logger) {
    if (args.length == 0) {
        logger.fatal('publish changelog <start-tag>');
        return;
    }
    cl(config, null, { from: args[0] })
        .on('error', function (err) {
        logger.error('Failed to generate changelog: ' + err);
    })
        .pipe(changelogStream)
        .on('close', prependDelta);
}
exports.default = changelog;
//# sourceMappingURL=/home/ghetolay/git/angular-cli/src/changelog.js.map