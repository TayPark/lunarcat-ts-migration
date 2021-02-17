import { User } from '../interfaces/users.interface';
import HttpException from '../lib/httpException';
import userModel from '../models/users.model';

export class AuthService {
  public users = userModel;

  public async findAll(): Promise<User[]> {
    const users: User[] = await this.users.find();
    return users;
  }

  public async findById(userId: string): Promise<User> {
    const targetUser: User = await this.users.findOne({ _id: userId });

    return targetUser;
  }

  public async findByEmail(userEmail: string): Promise<User> {
    const findUser: User = await this.users.findOne({ email: userEmail });
    
    return findUser;
  }

  public async login(email: string, password: string): Promise<User> {
    const findUser: User = await this.users.findOne({ email, password });

    return findUser;
  }

  public async findByUserDto(userData: Partial<User>): Promise<User> {
    return await this.users.findOne({ ...userData });
  }

  public async createUser(userData: Partial<User>): Promise<User> {
    if (!userData) {
      throw new HttpException(400, 'Input data is not satisfied');
    }

    const findUser: User = await this.users.findOne({ email: userData.email });
    if (findUser) {
      throw new HttpException(409, `Duplicated email ${userData.email}`);
    }

    const createUserData: User = await this.users.create(userData);
    return createUserData;
  }

  public async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    if (!userId || !userData) {
      throw new HttpException(400, 'User id and data required');
    }

    const updateUserData = await this.users.findByIdAndUpdate({ _id: userId }, { ...userData });

    if (!updateUserData) {
      throw new HttpException(409, 'Not a user');
    }

    return updateUserData;
  }

  public async deleteUser(userId: string) {
    const deleteUser: User = await this.users.findByIdAndDelete(userId);
    if (!deleteUser) {
      throw new HttpException(409, 'Not a user');
    }

    return deleteUser;
  }
}
