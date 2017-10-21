import { Logger } from './logger';
import 'rxjs/add/operator/map';
export declare class IndentLogger extends Logger {
    constructor(name: string, parent?: Logger | null, indentation?: string);
}
