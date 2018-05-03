/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */

export class UncleanWorkingDirectoryError extends Error {
    constructor() {
        super("The working directory is not clean.");

        const proto = new.target.prototype;
        if (Object.setPrototypeOf) Object.setPrototypeOf(this, proto);
        else (this as any).__proto__ = new.target.prototype;
    }
}
