"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const json_schema_1 = require("@ngtools/json-schema");
function buildSchema(inFile, _logger) {
    const jsonSchema = JSON.parse(fs.readFileSync(inFile, 'utf-8'));
    const SchemaClass = json_schema_1.SchemaClassFactory(jsonSchema);
    const schemaInstance = new SchemaClass({});
    return schemaInstance.$$serialize('text/x.dts', 'CliConfig');
}
exports.buildSchema = buildSchema;
function build(args, _opts, logger) {
    const inFile = args[1];
    const outFile = args[2];
    if (!inFile) {
        logger.fatal('Command build-schema needs an input file.');
        return;
    }
    const output = require('./build-schema').buildSchema(inFile, logger);
    if (outFile) {
        fs.writeFileSync(outFile, output, { encoding: 'utf-8' });
    }
    else {
        logger.info(output);
    }
}
exports.build = build;
//# sourceMappingURL=/home/ghetolay/git/angular-cli/src/build-schema.js.map