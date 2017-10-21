"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const semver_1 = require("semver");
function patch(args, opts, logger) {
    const newVersion = args[0];
    const incFn = opts.patch ? (v) => v.inc('patch') : (v) => v;
    if (!newVersion) {
        logger.fatal('Need to pass in a new version.');
        return;
    }
    const { packages } = require('../../../lib/packages');
    const rootPackageJson = path.join(__dirname, '../../../package.json');
    for (const packageName of Object.keys(packages)) {
        if (packageName == 'angular-cli') {
            // Skip the main package.
            continue;
        }
        const pkgJson = require(packages[packageName].packageJson);
        const version = new semver_1.SemVer(pkgJson['version']);
        const oldVersion = version.toString();
        pkgJson['version'] = incFn(version).toString();
        fs.writeFileSync(packages[packageName].packageJson, JSON.stringify(pkgJson, null, 2) + '\n');
        logger.info(`${packageName}: ${oldVersion} => ${pkgJson['version']}`);
    }
    // Do the main package.
    const angularCliPackageJson = require(rootPackageJson);
    angularCliPackageJson['version'] = newVersion;
    fs.writeFileSync(rootPackageJson, JSON.stringify(angularCliPackageJson, null, 2) + '\n');
}
exports.default = patch;
//# sourceMappingURL=/home/ghetolay/git/angular-cli/src/update-version.js.map