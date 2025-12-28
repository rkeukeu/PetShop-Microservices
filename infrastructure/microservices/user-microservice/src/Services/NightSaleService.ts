import { ISaleService } from "../Domain/services/ISaleService";

export class NightSaleService implements ISaleService {
  calculateFinalPrice(basePrice: number): number {
    return basePrice * 1.1;
  }
}
