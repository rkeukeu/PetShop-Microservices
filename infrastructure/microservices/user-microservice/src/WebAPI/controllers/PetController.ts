import { Request, Response, Router } from "express";
import { IPetService } from "../../Domain/services/IPetService";
import { ILogerService } from "../../Domain/services/ILogerService";

export class PetController {
  private router = Router();

  constructor(
    private petService: IPetService,
    private logerService: ILogerService
  ) {
    this.setupRoutes();
  }

  private setupRoutes() {
    // 1. Specifične rute (Ove moraju biti IZNAD "/")
    this.router.get("/receipts", this.getReceipts.bind(this));
    this.router.post("/sell", this.sell.bind(this));

    // 2. Opšte rute
    this.router.get("/", this.getAll.bind(this));
    this.router.post("/", this.create.bind(this));
  }

  private async getAll(req: Request, res: Response) {
    const pets = await this.petService.getAllPets();
    res.json(pets);
  }

  private async create(req: Request, res: Response) {
    try {
      const pet = await this.petService.addPet(req.body);
      res.status(201).json(pet);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  private async sell(req: Request, res: Response) {
    try {
      const { petId, sellerName } = req.body;
      const receipt = await this.petService.sellPet(Number(petId), sellerName);
      res.status(200).json(receipt);
    } catch (error: any) {
      await this.logerService.log(
        "ERROR",
        `Prodaja neuspela: ${error.message}`
      );
      res.status(400).json({ message: error.message });
    }
  }

  private async getReceipts(req: Request, res: Response) {
    try {
      const receipts = await this.petService.getAllReceipts();
      res.json(receipts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public getRouter() {
    return this.router;
  }
}
