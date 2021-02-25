import crypto from 'crypto';
import util from 'util';
import jwt from 'jsonwebtoken';

import { UserEntity } from '../domains/users.entity';
import { NotFoundException, BadRequestException, ForbiddenException } from '../lib/exceptions';
import { AuthRepository } from '../repositories/auth.repo';
import { UserProfileDto } from '../dtos/users.dto';

class UsersService {
  private readonly authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  public async getUserProfile(userId: string): Promise<UserEntity> {
    const findUser: UserEntity = await this.authRepository.findById(userId);

    if (!findUser) {
      throw new NotFoundException('Cannot find user');
    }

    return findUser;
  }

  public async postUserProfile(userId: string, userProfileDto: UserProfileDto): Promise<UserEntity> {
    const findUser: UserEntity = await this.authRepository.findById(userId);

    if (!findUser) {
      throw new NotFoundException('Cannot find user');
    }

    const updateProfile: UserEntity = await this.authRepository.updateUser(userId, userProfileDto);

    return updateProfile;
  }
}

export default UsersService;
