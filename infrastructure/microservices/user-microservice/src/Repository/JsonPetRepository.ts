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
    const index = all.findIndex((p) => p.id === data.id);

    if (index !== -1) {
      // Ako postoji, ažuriraj ga (ovo sprečava duplikate)
      all[index] = data;
    } else {
      // Ako ne postoji (novi je), dodaj ga
      // Ovde možeš dodati logiku za automatski ID ako već nije postavljen
      all.push(data);
    }

    await fs.promises.writeFile(this.dbPath, JSON.stringify(all, null, 2));
    return data;
  }
}
