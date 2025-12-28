import { Pet } from "../Domain/models/Pet";

export interface IPetRepository {
  getAll(): Promise<Pet[]>;
  getById(id: number): Promise<Pet | undefined>;
  save(pet: Pet): Promise<Pet>;
}
