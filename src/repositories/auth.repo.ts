import { UserEntity } from '../domains/users.entity';

export interface AuthRepository {
  // find by
  findById(userId: string): Promise<UserEntity>;
  findByEmail(email: string): Promise<UserEntity>;
  findByUserDto(userData: Partial<UserEntity>): Promise<UserEntity>;
  findBySnsId(snsId: string, snsType: string): Promise<UserEntity>;

  // default CRUD
  createUser(createUserDto: Partial<UserEntity>): Promise<UserEntity>;
  findAll(): Promise<UserEntity[]>;
  updateUser(userId: string, updateUserDto: Partial<UserEntity>): Promise<UserEntity>;
  deleteUser(deleteUserId: string): Promise<UserEntity>;

  // etc
  login(email: string, password: string): Promise<UserEntity>;
  confirmUser(email: string, token: string): Promise<UserEntity>;
}
