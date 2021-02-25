import { UserEntity } from '../domains/users.entity';
import { UpdateUserDto } from '../dtos/users.dto';
import { UsersRepository } from './users.repo';
import userModel from '../models/users.model';

class MongoUsersRepository implements UsersRepository {
  private readonly users = userModel;
  private projectionOption = {
    deactivatedAt: 0,
    token: 0,
    password: 0,
    salt: 0,
  };

  async getUserProfile(userId: string): Promise<Partial<UserEntity>> {
    return this.users.findOne({ _id: userId }, this.projectionOption).lean();
  }

  async updateUserProfile(userId: string, updateData: UpdateUserDto): Promise<Partial<UserEntity>> {
    return this.users.findOneAndUpdate(
      { _id: userId },
      { ...updateData },
      {
        new: true,  // return updated data. default is false (MongoDB 4.0~)
        projection: this.projectionOption,
      }
    );
  }
}

export default MongoUsersRepository;
