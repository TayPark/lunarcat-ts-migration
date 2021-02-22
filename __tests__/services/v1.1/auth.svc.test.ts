import mongoose from 'mongoose';
import randomString from 'random-string';
import { User } from '../../../src/interfaces/users.interface';
import { connectDatabase } from '../../../src/lib/database';
import MongoAuthRepository from '../../../src/repositories/mongo.auth.repo';
import AuthService from '../../../src/services/auth.service';

describe('UserService', () => {
  let authService: AuthService;

  beforeAll(async () => {
    await connectDatabase();
    mongoose.connection.dropCollection('users');
  });

  afterAll(() => {
    mongoose.connection.close();
  });

  beforeEach(async () => {
    authService = new AuthService(new MongoAuthRepository());
  });

  it('should be defined: authService', () => {
    expect(authService).toBeDefined();
  });

  // describe('AuthService.createUser()', () => {
  //   test('성공', async () => {
  //     const inputData: any = {
  //       email: randomString() + '@email.com',
  //       password: randomString(),
  //       nickname: 'tester',
  //     };

  //     const allUser: User[] = await authService.findAll();
  //     authService.createUser(inputData);
  //     const afterCreation: User[] = await authService.findAll();

  //     expect(afterCreation.length).toBeGreaterThan(allUser.length);
  //   });

  //   test('입력 데이터 부적절', async () => {
  //     const inputData: any = {
  //       email: randomString() + '@email.com',
  //       userPw: 'q1w2e3r4!',
  //       userPwRe: 'q1w2e3r4!',
  //       userLang: 1,
  //       userNick: 'tester',
  //     };

  //     try {
  //       authService.createUser(inputData);
  //     } catch (e) {
  //       expect(e).toBeInstanceOf(Error);
  //     }
  //   });
  // })

  // describe('AuthService.findById', () => {
  //   test('성공', async () => {
  //     const inputData: any = {
  //       email: randomString() + '@email.com',
  //       password: 'q1w2e3r4!',
  //       nickname: 'tester',
  //     };

  //     const createUser: User = await authService.createUser(inputData);
  //     const findUser: User = await authService.findById(createUser._id);
  //     expect(createUser._id.toString()).toBe(findUser._id.toString());
  //   })

  //   test('실패', async () => {
  //     try {
  //       await authService.findById(randomString(24));
  //     } catch (e) {
  //       expect(e).toBeInstanceOf(Error);
  //     }
  //   })
  // })

  describe('AuthService.findByEmail()', () => {});

  describe('AuthService.login()', () => {});

  describe('AuthService.updateUser()', () => {});

  describe('AuthService.deleteUser()', () => {});

  describe('AuthService.confirmUser()', () => {});

  describe('AuthService.findBySnsId()', () => {});
});
