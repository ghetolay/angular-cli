"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Observable_1 = require("rxjs/Observable");
const Subject_1 = require("rxjs/Subject");
class Logger extends Observable_1.Observable {
    constructor(name, parent = null) {
        super();
        this.name = name;
        this.parent = parent;
        this._subject = new Subject_1.Subject();
        let path = [];
        let p = parent;
        while (p) {
            path.push(p.name);
            p = p.parent;
        }
        this._metadata = { name, path };
        this._observable = this._subject.asObservable();
        if (this.parent) {
            // When the parent completes, complete us as well.
            this.parent._subject.subscribe(undefined, undefined, () => this.complete());
        }
    }
    get _observable() { return this._obs; }
    set _observable(v) {
        if (this._subscription) {
            this._subscription.unsubscribe();
        }
        this._obs = v;
        if (this.parent) {
            this._subscription = this.subscribe((value) => {
                if (this.parent) {
                    this.parent._subject.next(value);
                }
            }, (error) => {
                if (this.parent) {
                    this.parent._subject.error(error);
                }
            }, () => {
                if (this._subscription) {
                    this._subscription.unsubscribe();
                }
                this._subscription = null;
            });
        }
    }
    complete() {
        this._subject.complete();
    }
    log(level, message, metadata = {}) {
        const entry = Object.assign({}, this._metadata, metadata, {
            level, message, timestamp: +Date.now()
        });
        this._subject.next(entry);
    }
    debug(message, metadata = {}) {
        return this.log('debug', message, metadata);
    }
    info(message, metadata = {}) {
        return this.log('info', message, metadata);
    }
    warn(message, metadata = {}) {
        return this.log('warn', message, metadata);
    }
    error(message, metadata = {}) {
        return this.log('error', message, metadata);
    }
    fatal(message, metadata = {}) {
        return this.log('fatal', message, metadata);
    }
    toString() {
        return `<Logger(${this.name})>`;
    }
    lift(operator) {
        return this._observable.lift(operator);
    }
    subscribe(_observerOrNext, _error, _complete) {
        return this._observable.subscribe.apply(this._observable, arguments);
    }
    forEach(next, PromiseCtor) {
        return this._observable.forEach(next, PromiseCtor);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=/home/ghetolay/git/angular-cli/src/logger.js.map