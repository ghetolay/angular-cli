"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class JsonSchemaErrorBase extends Error {
    constructor(message) {
        super();
        if (message) {
            this.message = message;
        }
        else {
            this.message = this.constructor.name;
        }
    }
}
exports.JsonSchemaErrorBase = JsonSchemaErrorBase;
//# sourceMappingURL=/home/ghetolay/git/angular-cli/src/error.js.map