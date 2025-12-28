import { ILogerService } from "../Domain/services/ILogerService";
import { Pet } from "../Domain/models/Pet";
import { IPetRepository } from "../Repository/IPetRepository";
import { IPetService } from "../Domain/services/IPetService";
import { ISaleService } from "../Domain/services/ISaleService";
import { JsonReceiptRepository } from "../Repository/JsonReceiptRepository";
import { Receipt } from "../Domain/models/Receipt";

export class PetService implements IPetService {
  constructor(
    private petRepository: IPetRepository,
    private receiptRepository: JsonReceiptRepository,
    private logerService: ILogerService,
    private saleService: ISaleService
  ) {}

  async getAllPets(): Promise<Pet[]> {
    return await this.petRepository.getAll();
  }

  async addPet(data: Pet): Promise<Pet> {
    const allPets = await this.petRepository.getAll();

    if (allPets.length >= 10) {
      await this.logerService.log(
        "ERROR",
        "Neuspešno dodavanje: Prodavnica je puna (10/10)."
      );
      throw new Error("Kapacitet prodavnice je popunjen!");
    }

    const newPet = await this.petRepository.save(data);
    await this.logerService.log(
      "INFO",
      `Dodat novi ljubimac: ${data.commonName}`
    );
    return newPet;
  }

  async sellPet(petId: number, sellerName: string): Promise<Receipt> {
    const pet = await this.petRepository.getById(petId);
    if (!pet || pet.isSold)
      throw new Error("Ljubimac nije dostupan za prodaju.");

    const finalPrice = Number(
      this.saleService.calculateFinalPrice(pet.price).toFixed(2)
    );

    // 1. Markiraj ljubimca kao prodatog
    pet.isSold = true;
    await this.petRepository.save(pet);

    // 2. Kreiraj i sačuvaj fiskalni račun
    const newReceipt = new Receipt();
    newReceipt.id = Date.now();
    newReceipt.sellerName = sellerName;
    newReceipt.date = new Date().toLocaleString();
    newReceipt.totalAmount = finalPrice;
    newReceipt.petName = pet.commonName;
    newReceipt.petId = pet.id;

    await this.receiptRepository.save(newReceipt);

    // 3. Loguj akciju
    await this.logerService.log(
      "INFO",
      `Izdat račun #${newReceipt.id} - Prodavac: ${sellerName}`
    );

    return newReceipt;
  }

  // Dodajemo metodu koju menadžer može da pozove
  async getAllReceipts(): Promise<Receipt[]> {
    return await this.receiptRepository.getAll();
  }
}
