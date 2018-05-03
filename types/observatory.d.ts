/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */

declare module "observatory" {
    interface IObservatoryTask {
        status: (statusLabel: string) => this;
        running: (detailsLabel: string) => this;
        details: (detailsLabel: string) => this;
        done: (statusLabel: string) => this;
        fail: (statusLabel: string) => this;
    }
    export function add(name: string): IObservatoryTask;
}
