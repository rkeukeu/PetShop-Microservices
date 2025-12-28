import { ISaleService } from "../Domain/services/ISaleService";

export class DailySaleService implements ISaleService {
  calculateFinalPrice(basePrice: number): number {
    return basePrice * 0.85;
  }
}
