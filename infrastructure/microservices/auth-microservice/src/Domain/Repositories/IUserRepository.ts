import { User } from "../models/User";

export interface IUserRepository {
  getByUsername(username: string): Promise<User | undefined>;
  getByEmail(email: string): Promise<User | undefined>;
  save(user: User): Promise<User>;
}
