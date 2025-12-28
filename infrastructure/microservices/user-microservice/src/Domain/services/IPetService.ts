import { Pet } from "../models/Pet";

export interface IPetService {
  getAllPets(): Promise<Pet[]>;
  addPet(data: Pet): Promise<Pet>;
  sellPet(petId: number, sellerName: string): Promise<any>;
  getAllReceipts(): Promise<any[]>;
}
