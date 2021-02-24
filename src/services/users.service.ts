import crypto from 'crypto';
import util from 'util';
import jwt from 'jsonwebtoken';

import { User } from '../interfaces/users.interface';
import { NotFoundException, BadRequestException, ForbiddenException } from '../lib/exceptions';
import { AuthRepository } from '../repositories/auth.repo';
import { UserProfileDto } from '../dtos/users.dto';

class UsersService {
  private readonly authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  public async getUserProfile(userId: string): Promise<User> {
    const findUser: User = await this.authRepository.findById(userId);

    if (!findUser) {
      throw new NotFoundException('Cannot find user');
    }

    return findUser;
  }

  public async postUserProfile(userId: string, userProfileDto: UserProfileDto): Promise<User> {
    const findUser: User = await this.authRepository.findById(userId);

    if (!findUser) {
      throw new NotFoundException('Cannot find user');
    }

    const updateProfile: User = await this.authRepository.updateUser(userId, userProfileDto);

    return updateProfile;
  }
}

export default UsersService;
