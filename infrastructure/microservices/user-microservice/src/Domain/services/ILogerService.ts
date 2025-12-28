export interface ILogerService {
  log(type: "INFO" | "ERROR" | "WARNING", message: string): Promise<boolean>;
}
