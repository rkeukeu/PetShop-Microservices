import { Repository } from "typeorm";
import bcrypt from "bcryptjs";
import { User } from "../Domain/models/User";
import { IAuthService } from "../Domain/services/IAuthService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { AuthResponseType } from "../Domain/types/AuthResponse";
import { ILogerService } from "../Domain/services/ILogerService";
import { IUserRepository } from "../Domain/Repositories/IUserRepository";

export class AuthService implements IAuthService {
  private readonly saltRounds: number = parseInt(
    process.env.SALT_ROUNDS || "10",
    10
  );

  constructor(
    private userRepository: IUserRepository,
    private logerService: ILogerService
  ) {}

  async login(data: LoginUserDTO): Promise<AuthResponseType> {
    await this.logerService.log(
      "INFO",
      `Pokušaj prijave za korisnika: ${data.username}`
    );

    const user = await this.userRepository.getByUsername(data.username);

    if (!user) {
      await this.logerService.log(
        "WARNING",
        `Neuspešna prijava: Korisnik ${data.username} nije pronađen.`
      );
      return { authenificated: false };
    }

    const passwordMatches = await bcrypt.compare(data.password, user.password);
    if (!passwordMatches) return { authenificated: false };

    return {
      authenificated: true,
      userData: { id: user.id, username: user.username, role: user.role },
    };
  }

  async register(data: RegistrationUserDTO): Promise<AuthResponseType> {
    await this.logerService.log(
      "INFO",
      `Zahtev za registraciju: ${data.username}`
    );

    const existingUser = await this.userRepository.getByUsername(data.username);
    const existingEmail = await this.userRepository.getByEmail(data.email);

    if (existingUser || existingEmail) {
      await this.logerService.log(
        "WARNING",
        `Registracija odbijena: Korisnik ili email već postoji.`
      );
      return { authenificated: false };
    }

    const hashedPassword = await bcrypt.hash(data.password, this.saltRounds);

    const newUser: User = {
      id: Date.now(),
      username: data.username,
      email: data.email,
      role: data.role,
      password: hashedPassword,
      profileImage: data.profileImage ?? null,
    } as User;

    const savedUser = await this.userRepository.save(newUser);

    return {
      authenificated: true,
      userData: {
        id: savedUser.id,
        username: savedUser.username,
        role: savedUser.role,
      },
    };
  }
}
