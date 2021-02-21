import { User } from '../interfaces/users.interface';
import HttpException from '../lib/httpException';
import userModel from '../models/users.model';

class AuthService {
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

  // public async findByUserDto(userData: Partial<User>): Promise<User> {
  //   const findUser: User = await this.users.findOne({ ...userData });
  //   return findUser;
  // }

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

  public async deleteUser(userId: string): Promise<User> {
    const deleteUser: User = await this.users.findByIdAndDelete(userId);

    if (!deleteUser) {
      throw new HttpException(404, 'User not found');
    }

    return deleteUser;
  }

  public async confirmUser(email: string, token: string): Promise<User> {
    const findUser: User = await this.users.findOne({ email, token });

    if (!findUser) {
      throw new HttpException(409, 'Not a user');
    }

    if (findUser.token === null && findUser.isConfirmed === true) {
      throw new HttpException(409, 'Already confirmed');
    }

    const updateUser: User = await this.users.updateOne(
      { email },
      { isConfirmed: true, token: null }
    );

    return updateUser;
  }

  public async findBySnsId(snsId: string, snsType: string): Promise<User> {
    const findUser: User = await this.users.findOne({ snsId, snsType });

    return findUser;
  }
}

export default AuthService;
