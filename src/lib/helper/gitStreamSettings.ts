/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */

import {existsSync} from "fs";
import {parseSync} from "iniparser";
import {resolve} from "path";

const BRANCH_CONFIG = 'gitstream "branch"';
const PREFIX_CONFIG = 'gitstream "prefix"';

export interface IGitStreamSettings {
    develop: string;
}

export function gitStreamSettings(): IGitStreamSettings {
    const file = `${resolve(".")}/.git/config`;

    if (!existsSync(file)) {
        throw new Error(`Git Config File is missing: ${file}`);
    }

    const iniData = parseSync(file) as any;

    if (!iniData) {
        throw new Error("Failed to parse init file");
    }

    if (!iniData[BRANCH_CONFIG] || !iniData[BRANCH_CONFIG].working) {
        throw new Error("Git config missing git-stream branch configuration");
    }

    return {
        develop: iniData[BRANCH_CONFIG].working,
    };
}
