/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */

export class GitResetError extends Error {
    constructor(public original_error?: Error) {
        super(original_error ? original_error.message : "Unknown Error, Resetting.");
        const proto = new.target.prototype;
        if (Object.setPrototypeOf) Object.setPrototypeOf(this, proto);
        else (this as any).__proto__ = new.target.prototype;
    }
}
