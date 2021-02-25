import crypto from 'crypto';
import util from 'util';
import jwt from 'jsonwebtoken';

import { UserEntity } from '../domains/users.entity';
import { NotFoundException, BadRequestException, ForbiddenException } from '../lib/exceptions';
import { UserProfileDto } from '../dtos/users.dto';
import { UsersRepository } from '../repositories/users.repo';

class UsersService {
  private readonly usersRepository: UsersRepository;

  constructor(usersRepository: UsersRepository) {
    this.usersRepository = usersRepository;
  }

  public async getUserProfile(userId: string): Promise<Partial<UserEntity>> {
    const findUser: Partial<UserEntity> = await this.usersRepository.getUserProfile(userId);

    if (!findUser) {
      throw new NotFoundException('Cannot find user');
    }

    return findUser;
  }

  public async postUserProfile(
    userId: string,
    userProfileDto: UserProfileDto
  ): Promise<Partial<UserEntity>> {
    const findUser: Partial<UserEntity> = await this.usersRepository.getUserProfile(userId);

    if (!findUser) {
      throw new NotFoundException('Cannot find user');
    }

    const updateProfile: Partial<UserEntity> = await this.usersRepository.updateUserProfile(userId, userProfileDto);

    return updateProfile;
  }
}

export default UsersService;
