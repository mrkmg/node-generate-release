/**
 * Generate Release
 * Written by Kevin Gravier <kevin@mrkmg.com>
 * MIT License 2018
 */
import {writeFileSync} from "fs";

export class PackageFile {
  public packageFileLocation: string;
  public packageFileData: any = {};

  constructor(packageFileLocation: string) {
      this.packageFileLocation = packageFileLocation;
  }

  public load() {
      this.packageFileData = require(this.packageFileLocation);
  }

  public save() {
      const packageString = JSON.stringify(this.packageFileData, null, 2) + "\n";
      writeFileSync(this.packageFileLocation, packageString, "utf8");
  }

  public setVersion(version: string) {
      this.packageFileData.version = version;
  }

  public getVersion() {
      return this.packageFileData.version;
  }
}
