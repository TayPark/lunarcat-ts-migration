import { UserEntity } from '../domains/users.entity';
import { UpdateUserDto } from '../dtos/users.dto';
import { UsersRepository } from './users.repo';
import userModel from '../models/users.model';

class MongoUsersRepository implements UsersRepository {
  private readonly users = userModel;

  async getUserProfile(userId: string): Promise<Partial<UserEntity>> {
    return this.users.findOne(
      { _id: userId },
      {
        deactivatedAt: 0,
        token: 0,
        password: 0,
        salt: 0,
      }
    );
  }

  async updateUserProfile(userId: string, updateData: UpdateUserDto): Promise<UserEntity> {
    return this.users.updateOne({ _id: userId }, { ...updateData });
  }
}

export default MongoUsersRepository;
