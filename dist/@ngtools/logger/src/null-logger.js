"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./logger");
const Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/empty");
class NullLogger extends logger_1.Logger {
    constructor(parent = null) {
        super('', parent);
        this._observable = Observable_1.Observable.empty();
    }
}
exports.NullLogger = NullLogger;
//# sourceMappingURL=/home/ghetolay/git/angular-cli/src/null-logger.js.map