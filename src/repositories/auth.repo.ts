import { User } from '../interfaces/users.interface';

export interface AuthRepository {
  // find by
  findById(userId: string): Promise<User>;
  findByEmail(email: string): Promise<User>;
  findByUserDto(userData: Partial<User>): Promise<User>;
  findBySnsId(snsId: string, snsType: string): Promise<User>;
  
  // default CRUD
  createUser(createUserDto: Partial<User>): Promise<User>;
  findAll(): Promise<User[]>;
  updateUser(userId: string, updateUserDto: Partial<User>): Promise<User>;
  deleteUser(deleteUserId: string): Promise<User>;
  
  // etc
  login(email: string, password: string): Promise<User>;
  confirmUser(email: string, token: string): Promise<User>;
}
