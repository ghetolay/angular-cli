"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./logger");
require("rxjs/add/operator/map");
/**
 * Keep an map of indentation => array of indentations based on the level.
 * This is to optimize calculating the prefix based on the indentation itself. Since most logs
 * come from similar levels, and with similar indentation strings, this will be shared by all
 * loggers. Also, string concatenation is expensive so performing concats for every log entries
 * is expensive; this alleviates it.
 */
const indentationMap = {};
class IndentLogger extends logger_1.Logger {
    constructor(name, parent = null, indentation = '  ') {
        super(name, parent);
        indentationMap[indentation] = indentationMap[indentation] || [''];
        const map = indentationMap[indentation];
        this._observable = this._observable.map(entry => {
            const l = entry.path.length;
            if (l >= map.length) {
                let current = map[map.length - 1];
                while (l >= map.length) {
                    current += indentation;
                    map.push(current);
                }
            }
            entry.message = map[l] + entry.message;
            return entry;
        });
    }
}
exports.IndentLogger = IndentLogger;
//# sourceMappingURL=/home/ghetolay/git/angular-cli/src/indent.js.map