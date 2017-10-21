import { Observable } from 'rxjs/Observable';
import { Operator } from 'rxjs/Operator';
import { PartialObserver } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
export declare type JsonValue = boolean | number | string | JsonObject | JsonArray;
export interface JsonObject {
    [key: string]: JsonValue;
}
export interface JsonArray extends Array<JsonValue> {
}
export interface LoggerMetadata extends JsonObject {
    name: string;
    path: string[];
}
export interface LogEntry extends LoggerMetadata {
    level: LogLevel;
    message: string;
    timestamp: number;
}
export declare type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export declare class Logger extends Observable<LogEntry> {
    readonly name: string;
    readonly parent: Logger | null;
    protected readonly _subject: Subject<LogEntry>;
    protected _metadata: LoggerMetadata;
    private _obs;
    private _subscription;
    protected _observable: Observable<LogEntry>;
    constructor(name: string, parent?: Logger | null);
    complete(): void;
    log(level: LogLevel, message: string, metadata?: JsonObject): void;
    debug(message: string, metadata?: JsonObject): void;
    info(message: string, metadata?: JsonObject): void;
    warn(message: string, metadata?: JsonObject): void;
    error(message: string, metadata?: JsonObject): void;
    fatal(message: string, metadata?: JsonObject): void;
    toString(): string;
    lift<R>(operator: Operator<LogEntry, R>): Observable<R>;
    subscribe(): Subscription;
    subscribe(observer: PartialObserver<LogEntry>): Subscription;
    subscribe(next?: (value: LogEntry) => void, error?: (error: any) => void, complete?: () => void): Subscription;
    forEach(next: (value: LogEntry) => void, PromiseCtor?: typeof Promise): Promise<void>;
}
