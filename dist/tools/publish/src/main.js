"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const logger_1 = require("@ngtools/logger");
const chalk_1 = require("chalk");
const minimist = require("minimist");
require("rxjs/add/operator/filter");
const argv = minimist(process.argv.slice(2), {
    boolean: ['verbose']
});
const rootLogger = new logger_1.IndentLogger('cling');
rootLogger
    .filter((entry) => (entry.level != 'debug' || argv['verbose']))
    .subscribe((entry) => {
    let color = chalk_1.white;
    let output = process.stdout;
    switch (entry.level) {
        case 'info':
            color = chalk_1.white;
            break;
        case 'warn':
            color = chalk_1.yellow;
            break;
        case 'error':
            color = chalk_1.red;
            output = process.stderr;
            break;
        case 'fatal':
            color = (x) => chalk_1.bold(chalk_1.red(x));
            output = process.stderr;
            break;
    }
    output.write(color(entry.message) + '\n');
});
rootLogger
    .filter((entry) => entry.level == 'fatal')
    .subscribe(() => {
    process.stderr.write('A fatal error happened. See details above.');
    process.exit(100);
});
const command = argv._.shift();
let commandFn = null;
switch (command) {
    case 'build':
        commandFn = require('./build').default;
        break;
    case 'build-schema':
        commandFn = require('./build-schema').default;
        break;
    case 'update-version':
        commandFn = require('./update-version').default;
        break;
    case 'changelog':
        commandFn = require('./changelog').default;
        break;
}
if (commandFn) {
    commandFn(argv._, argv, rootLogger);
}
//# sourceMappingURL=/home/ghetolay/git/angular-cli/src/main.js.map