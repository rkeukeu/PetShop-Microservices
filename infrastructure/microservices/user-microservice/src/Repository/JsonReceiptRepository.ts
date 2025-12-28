import fs from "fs";
import path from "path";
import { Receipt } from "../Domain/models/Receipt";

export class JsonReceiptRepository {
  private dbPath = path.join(process.cwd(), "src", "Database", "receipts.json");

  private readData(): Receipt[] {
    if (!fs.existsSync(this.dbPath)) {
      fs.writeFileSync(this.dbPath, JSON.stringify([], null, 2));
      return [];
    }
    const content = fs.readFileSync(this.dbPath, "utf-8");
    return JSON.parse(content || "[]");
  }

  async getAll(): Promise<Receipt[]> {
    return this.readData();
  }

  async save(receipt: Receipt): Promise<Receipt> {
    const receipts = this.readData();
    receipts.push(receipt);
    fs.writeFileSync(this.dbPath, JSON.stringify(receipts, null, 2));
    return receipt;
  }
}
