import { User } from '../interfaces/users.interface';
import { NotFoundException, BadRequestException } from '../lib/exceptions';
import HttpException from '../lib/httpException';
import { AuthRepository } from '../repositories/auth.repo';
class AuthService {
  private readonly authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  public async findAll(): Promise<User[]> {
    const users: User[] = await this.authRepository.findAll();
    return users;
  }

  public async findById(userId: string): Promise<User> {
    const findUser: User = await this.authRepository.findById(userId);
    return findUser;
  }

  public async findByEmail(userEmail: string): Promise<User> {
    const findUser: User = await this.authRepository.findByEmail(userEmail);
    return findUser;
  }

  public async login(email: string, password: string): Promise<User> {
    const findUser: User = await this.authRepository.login(email, password);

    if (!findUser) {
      throw new NotFoundException('User not found');
    }

    return findUser;
  }

  public async createUser(userData: Partial<User>): Promise<User> {
    if (!userData) {
      throw new BadRequestException('Input data is not satisfied');
    }

    const findUser: User = await this.authRepository.findByEmail(userData.email);

    if (findUser) {
      throw new BadRequestException(`Duplicated email ${userData.email}`);
    }

    const createUserData: User = await this.authRepository.createUser(userData);
    return createUserData;
  }

  public async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    if (!userId || !userData) {
      throw new BadRequestException('User id and data required');
    }

    const updateUserData = await this.authRepository.updateUser(userId, userData);

    if (!updateUserData) {
      throw new BadRequestException('Not a user');
    }

    return updateUserData;
  }

  public async deleteUser(userId: string): Promise<User> {
    const deleteUser: User = await this.authRepository.deleteUser(userId);

    if (!deleteUser) {
      throw new NotFoundException('User not found');
    }

    return deleteUser;
  }

  public async confirmUser(email: string, token: string): Promise<User> {
    const findUser: User = await this.authRepository.findByUserDto({ email, token });

    if (!findUser) {
      throw new BadRequestException('Not a user');
    }

    if (findUser.token === null && findUser.isConfirmed === true) {
      throw new BadRequestException('Already confirmed');
    }

    return findUser;
  }

  public async findBySnsId(snsId: string, snsType: string): Promise<User> {
    const findUser: User = await this.authRepository.findBySnsId(snsId, snsType);

    return findUser;
  }
}

export default AuthService;
