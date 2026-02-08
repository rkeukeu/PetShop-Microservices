import fs from "fs";
import path from "path";
import { IPetRepository } from "./IPetRepository";
import { Pet } from "../Domain/models/Pet";

export class JsonPetRepository implements IPetRepository {
  private dbPath = path.join(process.cwd(), "src", "Database", "pets.json");

  private readData(): Pet[] {
    if (!fs.existsSync(this.dbPath)) return [];
    const content = fs.readFileSync(this.dbPath, "utf-8");
    return JSON.parse(content || "[]");
  }

  async getAll(): Promise<Pet[]> {
    return this.readData();
  }

  async getById(id: number): Promise<Pet | undefined> {
    const pets = this.readData();
    return pets.find((p) => p.id === id);
  }

  async save(data: Pet): Promise<Pet> {
    const all = await this.getAll();

    // 1. Ako ljubimac nema ID, znači da je nov - dodeli mu sledeći slobodan broj
    if (!data.id) {
      const maxId = all.length > 0 ? Math.max(...all.map((p) => p.id)) : 0;
      data.id = maxId + 1;
      all.push(data);
    } else {
      // 2. Ako ima ID, proveri da li već postoji da bismo ga ažurirali (za sellPet)
      const index = all.findIndex((p) => p.id === data.id);
      if (index !== -1) {
        all[index] = data;
      } else {
        // Ovo je slučaj ako ručno uneseš ID koji ne postoji
        all.push(data);
      }
    }

    await fs.promises.writeFile(this.dbPath, JSON.stringify(all, null, 2));
    return data;
  }
}
