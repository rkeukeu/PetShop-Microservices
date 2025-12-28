import { IUsersService } from "../Domain/services/IUsersService";
import { User } from "../Domain/models/User";
import { UserDTO } from "../Domain/DTOs/UserDTO";
import { JsonUserRepository } from "../Repository/JsonUserRepository";

export class UsersService implements IUsersService {
  constructor(private userRepository: JsonUserRepository) {}

  /**
   * Get all users
   */
  async getAllUsers(): Promise<UserDTO[]> {
    // ISPRAVLJENO: Koristimo metodu iz tvog JsonUserRepository-ja
    const users = await this.userRepository.getAll();
    return users.map((u) => this.toDTO(u));
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<UserDTO> {
    // ISPRAVLJENO: JSON repo nema { where: { id } }, samo proslediš ID
    const user = await this.userRepository.getById(id);
    if (!user) throw new Error(`User with ID ${id} not found`);
    return this.toDTO(user);
  }

  /**
   * Convert User entity to UserDTO
   */
  private toDTO(user: User): UserDTO {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage ?? "",
    };
  }
}
