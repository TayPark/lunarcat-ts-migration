import { UserEntity } from '../domains/users.entity';
import userModel from '../models/users.model';
import { AuthRepository } from './auth.repo';

class MongoAuthRepository implements AuthRepository {
  private users = userModel;

  async findById(userId: string): Promise<UserEntity> {
    return this.users.findById(userId);
  }

  async findByEmail(email: string): Promise<UserEntity> {
    return this.users.findOne({ email });
  }

  async findByUserDto(userData: Partial<UserEntity>): Promise<UserEntity> {
    return this.users.findOne({ ...userData });
  }

  async findBySnsId(snsId: string, snsType: string): Promise<UserEntity> {
    return this.users.findOne({ snsId, snsType });
  }

  async createUser(createUserDto: Partial<UserEntity>): Promise<UserEntity> {
    return this.users.create(createUserDto);
  }

  async findAll(): Promise<UserEntity[]> {
    return this.users.find();
  }

  async updateUser(userId: string, updateUserDto: Partial<UserEntity>): Promise<UserEntity> {
    return this.users.findOneAndUpdate({ _id: userId }, { ...updateUserDto });
  }

  async deleteUser(deleteUserId: string): Promise<UserEntity> {
    return this.users.findOneAndDelete({ _id: deleteUserId });
  }

  async login(email: string, password: string): Promise<UserEntity> {
    return this.users.findOne({ email, password });
  }

  async confirmUser(email: string, token: string): Promise<UserEntity> {
    return this.users.findOneAndUpdate({ email, token }, { isConfirmed: true, token: null });
  }
}

export default MongoAuthRepository;
