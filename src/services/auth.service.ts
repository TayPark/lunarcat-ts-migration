import { User } from '../interfaces/users.interface';
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
    const targetUser: User = await this.authRepository.findById(userId);
    return targetUser;
  }

  public async findByEmail(userEmail: string): Promise<User> {
    const findUser: User = await this.authRepository.findByEmail(userEmail);
    return findUser;
  }

  public async login(email: string, password: string): Promise<User> {
    const findUser: User = await this.authRepository.login(email, password);
    return findUser;
  }

  public async createUser(userData: Partial<User>): Promise<User> {
    if (!userData) {
      throw new HttpException(400, 'Input data is not satisfied');
    }

    const findUser: User = await this.authRepository.findByEmail(userData.email);

    if (findUser) {
      throw new HttpException(409, `Duplicated email ${userData.email}`);
    }

    const createUserData: User = await this.authRepository.createUser(userData);
    return createUserData;
  }

  public async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    if (!userId || !userData) {
      throw new HttpException(400, 'User id and data required');
    }

    const updateUserData = await this.authRepository.updateUser(userId, userData);

    if (!updateUserData) {
      throw new HttpException(409, 'Not a user');
    }

    return updateUserData;
  }

  public async deleteUser(userId: string): Promise<User> {
    const deleteUser: User = await this.authRepository.deleteUser(userId);

    if (!deleteUser) {
      throw new HttpException(404, 'User not found');
    }

    return deleteUser;
  }

  public async confirmUser(email: string, token: string): Promise<User> {
    const findUser: User = await this.authRepository.findByUserDto({ email, token });

    if (!findUser) {
      throw new HttpException(409, 'Not a user');
    }

    if (findUser.token === null && findUser.isConfirmed === true) {
      throw new HttpException(409, 'Already confirmed');
    }

    return findUser;
  }

  public async findBySnsId(snsId: string, snsType: string): Promise<User> {
    const findUser: User = await this.authRepository.findBySnsId(snsId, snsType);

    return findUser;
  }
}

export default AuthService;
