import mongoose from 'mongoose';
import randomString from 'random-string';

import { UserEntity } from '../../../src/domains/users.entity';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '../../../src/lib/exceptions';
import { connectDatabase } from '../../../src/lib/database';
import UsersService from '../../../src/services/users.service';
import MongoUsersRepository from '../../../src/repositories/mongo.users.repo';
import AuthService from '../../../src/services/auth.service';
import MongoAuthRepository from '../../../src/repositories/mongo.auth.repo';
import { JoinDto, UpdateUserDto } from '../../../src/dtos/users.dto';

describe('UsersService', () => {
  let usersService: UsersService;
  let authService: AuthService;

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
    usersService = new UsersService(new MongoUsersRepository());
    authService = new AuthService(new MongoAuthRepository());
  });

  // it('should be defined: authService', () => {
  //   expect(usersService).toBeDefined();
  // });

  describe('getProfile()', () => {
    test('성공', async () => {
      const userPw: string = randomString();

      const userData: JoinDto = {
        email: randomString() + '@email.com',
        userPw,
        userPwRe: userPw,
        userLang: 0,
        userNick: 'getting profile'
      }

      const createUser: UserEntity = await authService.createUser(userData);
      const updateUser: Partial<UserEntity> = await usersService.getUserProfile(createUser._id);

      expect(createUser._id).toEqual(updateUser._id);
      expect(createUser.nickname).toEqual(updateUser.nickname);
    })
    
    test('실패: 존재하지 않는 아이디', async () => {
      try {
        await usersService.getUserProfile('012345678901234567890123');
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException)
      }
    })
  });

  describe('postProfile()', () => {
    test('성공', async () => {
      const userPw: string = randomString();

      const userData: JoinDto = {
        email: randomString() + '@email.com',
        userPw,
        userPwRe: userPw,
        userLang: 0,
        userNick: 'getting profile'
      }

      const updateData: UpdateUserDto = {
        intro: "introduce lunaracat",
        profile: {
          origin: "origin here",
        }
      }

      const createUser: UserEntity = await authService.createUser(userData);
      const updateUser: Partial<UserEntity> = await usersService.postUserProfile(createUser._id, updateData);

      expect(createUser._id).toEqual(updateUser._id);
      expect(createUser.intro).not.toEqual(updateUser.intro);
      expect(createUser.profile).not.toEqual(updateUser.profile)
    })
    
    test('실패: 존재하지 않는 아이디', async () => {
      try {
        await usersService.getUserProfile('012345678901234567890123');
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException)
      }
    })

    test('실패: 적절하지 않은 데이터', async () => {
      const userPw: string = randomString();

      const userData: JoinDto = {
        email: randomString() + '@email.com',
        userPw,
        userPwRe: userPw,
        userLang: 0,
        userNick: 'getting profile'
      }

      const updateData: any = {
        password: 'easy_password'
        // intro: "introduce lunaracat",
      }

      const createUser: UserEntity = await authService.createUser(userData);
      
      try {
        await usersService.postUserProfile(createUser._id, updateData);
      } catch (e) {
        console.error(e)
        expect(e).toBeInstanceOf(Error)
      }

      // expect(createUser._id).toEqual(updateUser._id);
      // expect(createUser.intro).not.toEqual(updateUser.intro);
      // expect(createUser.profile).not.toEqual(updateUser.profile)
    })
  });
});
