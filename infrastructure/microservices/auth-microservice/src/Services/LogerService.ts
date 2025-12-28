import { ILogerService } from "../Domain/services/ILogerService";
import fs from "fs";

export class LogerService implements ILogerService {
  private logFilePath = "./logs.txt";

  constructor() {
    console.log(`\x1b[35m[Logger@1.45.4]\x1b[0m Service started`);
  }

  async log(
    type: "INFO" | "ERROR" | "WARNING",
    message: string
  ): Promise<boolean> {
    const timestamp = new Date().toLocaleString();
    const logEntry = `[${timestamp}] [${type}]: ${message}\n`;

    try {
      fs.appendFileSync(this.logFilePath, logEntry);
      console.log(`\x1b[35m[Logger@1.45.4]\x1b[0m ${logEntry.trim()}`);
      return true;
    } catch (err) {
      console.error("Greška pri upisu loga:", err);
      return false;
    }
  }
}
