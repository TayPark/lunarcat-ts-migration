import mongoose from 'mongoose';
import randomString from 'random-string';

import { User } from '../../../src/interfaces/users.interface';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '../../../src/lib/exceptions';
import { connectDatabase } from '../../../src/lib/database';
import MongoAuthRepository from '../../../src/repositories/mongo.auth.repo';
import AuthService from '../../../src/services/auth.service';
import { JoinDto, SnsJoinDto, SnsLoginDto } from '../../../src/dtos/users.dto';
import { SnsType } from '../../../src/dtos/global.enums';

describe('AuthService', () => {
  let authService: AuthService;

  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(() => {
    mongoose.connection.close();
  });

  beforeEach(async () => {
    authService = new AuthService(new MongoAuthRepository());
  });

  // it('should be defined: authService', () => {
  //   expect(authService).toBeDefined();
  // });

  describe('createUser()', () => {
    test('성공', async () => {
      const userPw = randomString();
      const userData: JoinDto = {
        email: randomString() + '@email.com',
        userPw: userPw,
        userPwRe: userPw,
        userNick: randomString(),
        userLang: 1,
      };

      const result: User = await authService.createUser(userData);

      expect(result.email).toEqual(userData.email);
    });

    test('실패: 중복 생성', async () => {
      const userPw = randomString();
      const userData: JoinDto = {
        email: randomString() + '@email.com',
        userPw: userPw,
        userPwRe: userPw,
        userNick: randomString(),
        userLang: 1,
      };

      try {
        await authService.createUser(userData);
        await authService.createUser(userData);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('findById()', () => {
    test('성공', async () => {
      const userPw = randomString();
      const userData: JoinDto = {
        email: randomString() + '@email.com',
        userPw: userPw,
        userPwRe: userPw,
        userNick: randomString(),
        userLang: 1,
      };

      const createUser: User = await authService.createUser(userData);
      const findUser: User = await authService.findById(createUser._id);

      expect(createUser._id).toEqual(findUser._id);
    });

    test('실패: 존재하지 않음', async () => {
      const findUser: User = await authService.findById('012345678901234567891234');

      expect(findUser).toBeFalsy();
    });
  });

  describe('findByEmail()', () => {
    test('성공', async () => {
      const userPw = randomString();
      const userData: JoinDto = {
        email: randomString() + '@email.com',
        userPw: userPw,
        userPwRe: userPw,
        userNick: randomString(),
        userLang: 1,
      };

      const createUser: User = await authService.createUser(userData);
      const findUser: User = await authService.findByEmail(createUser.email);

      expect(createUser._id).toEqual(findUser._id);
    });

    test('실패: 존재하지 않음', async () => {
      const findUser: User = await authService.findByEmail(randomString() + '@email.com');

      expect(findUser).toBeFalsy();
    });
  });

  describe('findAll()', () => {
    test('성공', async () => {
      const userPw = randomString();
      const userData: JoinDto = {
        email: randomString() + '@email.com',
        userPw: userPw,
        userPwRe: userPw,
        userNick: randomString(),
        userLang: 1,
      };

      const createUser: User = await authService.createUser(userData);
      const findUser: User = await authService.findByEmail(createUser.email);

      expect(createUser._id).toEqual(findUser._id);
    });
  });

  describe('login()', () => {
    test('성공', async () => {
      const userPw = randomString();
      const userData: JoinDto = {
        email: randomString() + '@email.com',
        userPw: userPw,
        userPwRe: userPw,
        userNick: randomString(),
        userLang: 1,
      };

      const createUser = await authService.createUser(userData);
      const login = await authService.login(userData.email, userData.userPw);

      expect(createUser._id).toEqual(login._id);
    });

    test('실패: 존재하지 않는 이메일', async () => {
      try {
        await authService.login(randomString() + '@email.com', randomString());
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });

    test('실패: 비밀번호가 일치하지 않음', async () => {
      const userPw = randomString();
      const userData: JoinDto = {
        email: randomString() + '@email.com',
        userPw: userPw,
        userPwRe: userPw,
        userNick: randomString(),
        userLang: 1,
      };

      await authService.createUser(userData);

      try {
        await authService.login(userData.email, randomString());
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('updateUser()', () => {
    test('성공', async () => {
      const userPw = randomString();
      const userData: JoinDto = {
        email: randomString() + '@email.com',
        userPw: userPw,
        userPwRe: userPw,
        userNick: randomString(),
        userLang: 1,
      };

      const updatable: Partial<User> = {
        intro: 'Hello my dear',
        screenId: 'everytime',
        displayLanguage: 0,
      };

      const createUser: User = await authService.createUser(userData);
      await authService.updateUser(createUser._id, updatable);
      const updateUser: User = await authService.findByEmail(userData.email);

      expect(createUser._id).toEqual(updateUser._id);
      expect(updateUser.intro).toEqual(updatable.intro);
    });

    test('실패: 존재하지 않는 유저 Id', async () => {
      const updatable: Partial<User> = {
        intro: 'Hello my dear',
        screenId: 'everytime',
        displayLanguage: 0,
      };

      try {
        await authService.updateUser('012345678901234567890123', updatable);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });

    test('실패: 적절하지 않은 데이터', async () => {
      const userPw = randomString();
      const userData: JoinDto = {
        email: randomString() + '@email.com',
        userPw: userPw,
        userPwRe: userPw,
        userNick: randomString(),
        userLang: 1,
      };

      const updatable: any = {
        introduce: 'Hello my dear',
        screenID: 'everytime',
        // displayLanguage: 0
      };

      const createUser: User = await authService.createUser(userData);

      try {
        await authService.updateUser(createUser._id, updatable);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('changePassword()', () => {
    test('성공', async () => {
      const userPw = randomString();
      const userData: JoinDto = {
        email: randomString() + '@email.com',
        userPw: userPw,
        userPwRe: userPw,
        userNick: randomString(),
        userLang: 1,
      };

      const createUser: User = await authService.createUser(userData);

      const newPassword = randomString();

      await authService.changePassword(userData.email, newPassword);

      const loginUser: User = await authService.login(userData.email, newPassword);

      expect(loginUser.password).not.toBe(createUser.password);
    });

    test('실패: 존재하지 않는 유저', async () => {
      const userPw = randomString();
      const userData: JoinDto = {
        email: randomString() + '@email.com',
        userPw: userPw,
        userPwRe: userPw,
        userNick: randomString(),
        userLang: 1,
      };

      const createUser: User = await authService.createUser(userData);
      const newPassword = randomString();
      try {
        await authService.changePassword(randomString(), newPassword);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('deleteUser()', () => {
    test('성공', async () => {
      const userPw = randomString();
      const userData: JoinDto = {
        email: randomString() + '@email.com',
        userPw: userPw,
        userPwRe: userPw,
        userNick: randomString(),
        userLang: 1,
      };

      const createUser: User = await authService.createUser(userData);
      await authService.deleteUser(createUser._id);

      try {
        await authService.findById(createUser._id);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });

    test('실패: 존재하지 않는 유저 삭제 요청', async () => {
      try {
        await authService.deleteUser('012345678901234567890123');
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('confirmUser()', () => {
    test('성공', async () => {
      const userPw = randomString();
      const userData: JoinDto = {
        email: randomString() + '@email.com',
        userPw: userPw,
        userPwRe: userPw,
        userNick: randomString(),
        userLang: 1,
      };

      const createUser: User = await authService.createUser(userData);
      await authService.confirmUser(userData.email, createUser.token);
      const confirmUser: User = await authService.findByEmail(userData.email);

      expect(confirmUser.isConfirmed).toBe(true);
      expect(confirmUser.token).toBe(null);
    });

    test('실패: 존재하지 않는 유저', async () => {
      const userPw = randomString();
      const userData: JoinDto = {
        email: randomString() + '@email.com',
        userPw: userPw,
        userPwRe: userPw,
        userNick: randomString(),
        userLang: 1,
      };

      const createUser: User = await authService.createUser(userData);

      try {
        await authService.confirmUser(randomString() + '@email.com', createUser.token);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });

    test('실패: 이미 인증됨', async () => {
      const userPw = randomString();
      const userData: JoinDto = {
        email: randomString() + '@email.com',
        userPw: userPw,
        userPwRe: userPw,
        userNick: randomString(),
        userLang: 1,
      };

      const createUser: User = await authService.createUser(userData);
      await authService.confirmUser(userData.email, createUser.token);

      try {
        await authService.confirmUser(userData.email, createUser.token);
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
      }
    });

    test('실패: 일치하지 않는 token', async () => {
      const userPw = randomString();
      const userData: JoinDto = {
        email: randomString() + '@email.com',
        userPw: userPw,
        userPwRe: userPw,
        userNick: randomString(),
        userLang: 1,
      };

      const createUser: User = await authService.createUser(userData);

      try {
        await authService.confirmUser(userData.email, randomString());
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('createSnsUser', () => {
    test('성공', async () => {
      const snsJoinData: SnsJoinDto = {
        uid: (12345678901234).toString(),
        email: randomString() + '@email.com',
        profile: 'some_url_here',
        name: 'googler',
        displayLanguage: 0,
        snsType: SnsType.GOOGLE,
      };

      const createUser: User = await authService.createSnsUser(snsJoinData);

      expect(createUser).toBeDefined();
      expect(createUser.email).toBe(snsJoinData.email);
    });

    test('실패: 필수 데이터 누락', async () => {
      const snsJoinData: any = {
        uid: (12345678901234).toString(),
        email: randomString() + '@email.com',
        profile: 'some_url_here',
        name: 'googler',
        displayLanguage: 0,
        // snsType: SnsType.GOOGLE
      };

      try {
        await authService.createSnsUser(snsJoinData);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
      }
    });
  });

  describe('findBySnsId()', () => {
    test('성공', async () => {
      const snsJoinData: SnsJoinDto = {
        uid: (12345678901234).toString(),
        email: randomString() + '@email.com',
        profile: 'some_url_here',
        name: 'googler',
        displayLanguage: 0,
        snsType: SnsType.GOOGLE,
      };

      const createUser: User = await authService.createSnsUser(snsJoinData);

      expect(createUser).toBeDefined();

      const findUser: User = await authService.findBySnsId(snsJoinData.uid, snsJoinData.snsType);

      expect(findUser).toBeDefined();
    });

    test('실패: 존재하지 않음', async () => {
      const findUser: User = await authService.findBySnsId('12345678901234561', SnsType.GOOGLE);

      expect(findUser).toBeFalsy();
    });
  });
});
