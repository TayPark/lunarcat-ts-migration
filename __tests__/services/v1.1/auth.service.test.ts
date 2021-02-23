import mongoose from 'mongoose';
import randomString from 'random-string';

import { User } from '../../../src/interfaces/users.interface';
import { BadRequestException, NotFoundException } from '../../../src/lib/exceptions';
import { connectDatabase } from '../../../src/lib/database';
import MongoAuthRepository from '../../../src/repositories/mongo.auth.repo';
import AuthService from '../../../src/services/auth.service';
import { ValidationError } from 'joi';

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
      const userData: Partial<User> = {
        email: randomString() + '@email.com',
        password: randomString(),
        nickname: randomString(),
      };

      const result: User = await authService.createUser(userData);

      expect(result.email).toEqual(userData.email);
    });

    test('실패: 데이터 오류', async () => {
      const userData: any = {
        email: randomString() + '@email.com',
        userPw: randomString(),
        languages: randomString(),
      };

      try {
        await authService.createUser(userData);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
      }
    });

    test('실패: 중복 생성', async () => {
      const userData: Partial<User> = {
        email: randomString() + '@email.com',
        password: randomString(),
        nickname: randomString(),
      };

      try {
        await authService.createUser(userData);
        await authService.createUser(userData);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
      }
    });
  });

  describe('findById()', () => {
    test('성공', async () => {
      const userData: Partial<User> = {
        email: randomString() + '@email.com',
        password: randomString(),
        nickname: randomString(),
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
      const userData: Partial<User> = {
        email: randomString() + '@email.com',
        password: randomString(),
        nickname: randomString(),
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
      const userData: Partial<User> = {
        email: randomString() + '@email.com',
        password: randomString(),
        nickname: randomString(),
      };

      const createUser: User = await authService.createUser(userData);
      const findUser: User = await authService.findByEmail(createUser.email);

      expect(createUser._id).toEqual(findUser._id);
    });
  });

  describe('login()', () => {
    test('성공', async () => {
      const userData: Partial<User> = {
        email: randomString() + '@email.com',
        password: randomString(),
        nickname: randomString(),
      };

      const createUser = await authService.createUser(userData);
      const login = await authService.login(userData.email, userData.password);

      expect(createUser._id).toEqual(login._id);
    });

    test('실패: 존재하지 않는 이메일', async () => {
      const userData: Partial<User> = {
        email: randomString() + '@email.com',
        password: randomString(),
        nickname: randomString(),
      };

      await authService.createUser(userData);

      try {
        await authService.login(randomString() + '@email.com', userData.password);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });

    test('실패: 비밀번호가 일치하지 않음', async () => {
      const userData: Partial<User> = {
        email: randomString() + '@email.com',
        password: randomString(),
        nickname: randomString(),
      };

      await authService.createUser(userData);

      try {
        await authService.login(userData.email, randomString());
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('updateUser()', () => {
    test('성공', async () => {
      const userData: Partial<User> = {
        email: randomString() + '@email.com',
        password: randomString(),
        nickname: randomString(),
      };

      const updatable: Partial<User> = {
        intro: 'Hello my dear',
        screenId: 'everytime',
        displayLanguage: 0
      }

      const createUser: User = await authService.createUser(userData);
      const updateUser: User = await authService.updateUser(createUser._id, updatable);
      
      console.warn(createUser);
      console.warn(updateUser);

      expect(createUser._id).toEqual(updateUser._id);
      expect(updateUser.intro).toEqual(updatable.intro);
    });

    // test('실패: 적절하지 않은 데이터', async () => {
    //   const userData: Partial<User> = {
    //     email: randomString() + '@email.com',
    //     password: randomString(),
    //     nickname: randomString(),
    //   };

    //   const updatable: any = {
    //     intro: 'Hello my dear',
    //     screenId: 'everytime',
    //     displayLanguage: 0
    //   }

    //   const createUser: User = await authService.createUser(userData);
    //   const updateUser: User = await authService.updateUser(createUser._id, updatable);
      
    //   expect(createUser._id).toEqual(updateUser._id);
    //   expect(createUser.intro).toEqual(updatable.intro);
    // });
  });

  describe('deleteUser()', () => {});

  describe('confirmUser()', () => {});

  describe('findBySnsId()', () => {});

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
});
