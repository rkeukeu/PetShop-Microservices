import path from "path";
import { IUserRepository } from "./IUserRepository";
import { User } from "../models/User";
import fs from "fs";

export class JsonUserRepository implements IUserRepository {
  private dbPath = path.join(process.cwd(), "src", "Database", "users.json");

  private readData(): User[] {
    if (!fs.existsSync(this.dbPath)) return [];
    const content = fs.readFileSync(this.dbPath, "utf-8");
    return JSON.parse(content || "[]");
  }

  async getByUsername(username: string): Promise<User | undefined> {
    const users = this.readData();
    return users.find((u) => u.username === username);
  }

  async getByEmail(email: string): Promise<User | undefined> {
    const users = this.readData();
    return users.find((u) => u.email === email);
  }

  async save(user: User): Promise<User> {
    const users = this.readData();
    users.push(user);
    fs.writeFileSync(this.dbPath, JSON.stringify(users, null, 2));
    return user;
  }
}
