import { Logger } from './logger';
export declare type LoggerConstructor<T extends Logger> = {
    new (...args: any[]): T;
};
export declare class ConsoleLoggerStack {
    static push(name: string): Logger;
    static push(logger: Logger): Logger;
    static push<T extends Logger>(loggerClass: LoggerConstructor<T>, ...args: any[]): Logger;
    static pop(): Logger | null;
    static top(): Logger | null;
    static start(name: string): Logger;
    static start(logger: Logger): Logger;
    static start<T extends Logger>(loggerClass: LoggerConstructor<T>, ...args: any[]): Logger;
    static end(): void;
}
