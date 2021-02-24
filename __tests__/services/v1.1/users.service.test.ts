import mongoose from 'mongoose';
import randomString from 'random-string';

import { User } from '../../../src/interfaces/users.interface';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '../../../src/lib/exceptions';
import { connectDatabase } from '../../../src/lib/database';
import UsersService from '../../../src/services/users.service';
import MongoAuthRepository from '../../../src/repositories/mongo.auth.repo';

describe('UsersService', () => {
  let usersService: UsersService;

  beforeAll(async () => {
    await connectDatabase();
  });

  beforeEach(() => {
    // reference error 방지
    jest.useFakeTimers();
  });

  afterAll(() => {
    mongoose.connection.close();
  });

  beforeEach(async () => {
    usersService = new UsersService(new MongoAuthRepository());
  });

  it('should be defined: authService', () => {
    expect(usersService).toBeDefined();
  });

  describe('getProfile', () => {
    // 성공
    // 실패
  });

  describe('postProfile', () => {
    // 성공
    // 실패
  });
});
