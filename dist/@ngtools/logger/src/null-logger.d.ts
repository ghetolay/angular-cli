import { Logger } from './logger';
import 'rxjs/add/observable/empty';
export declare class NullLogger extends Logger {
    constructor(parent?: Logger | null);
}
