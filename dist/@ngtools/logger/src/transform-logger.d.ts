import { Observable } from 'rxjs/Observable';
import { Logger, LogEntry } from './logger';
export declare class TransformLogger extends Logger {
    constructor(name: string, transform: (stream: Observable<LogEntry>) => Observable<LogEntry>, parent?: Logger | null);
}
