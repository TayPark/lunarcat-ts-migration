import { UserEntity } from '../domains/users.entity';
import { UpdateUserDto } from '../dtos/users.dto';

export interface UsersRepository {
  getUserProfile(userId: string): Promise<Partial<UserEntity>>;
  updateUserProfile(userId: string, updateData: UpdateUserDto): Promise<Partial<UserEntity>>;
}
