import fs from "fs";
import path from "path";
import { User } from "../Domain/models/User";

export class JsonUserRepository {
  private dbPath = path.join(process.cwd(), "src", "Database", "users.json");

  private readData(): User[] {
    if (!fs.existsSync(this.dbPath)) {
      fs.writeFileSync(this.dbPath, JSON.stringify([], null, 2));
      return [];
    }
    const content = fs.readFileSync(this.dbPath, "utf-8");
    return JSON.parse(content || "[]");
  }

  async getAll(): Promise<User[]> {
    return this.readData();
  }

  async getById(id: number): Promise<User | undefined> {
    const users = this.readData();
    return users.find((u) => u.id === id);
  }

  async save(user: User): Promise<User> {
    const users = this.readData();
    const index = users.findIndex((u) => u.id === user.id);

    if (index !== -1) {
      users[index] = user;
    } else {
      users.push(user);
    }

    fs.writeFileSync(this.dbPath, JSON.stringify(users, null, 2));
    return user;
  }
}
