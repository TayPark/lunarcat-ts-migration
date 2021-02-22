import mongoose from 'mongoose';
import request from 'supertest';

import app from '../../../src/app';
import { connectDatabase, dropDatabase } from '../../../src/lib/database';
import randomString from 'random-string';
import { JoinDto } from '../../../src/dtos/users.dto';

beforeAll(async () => {
  await connectDatabase();
});

afterAll(async () => {
  await dropDatabase();
});

describe('/auth', () => {
  describe('회원가입', () => {
    test('회원가입 성공 | 201', async () => {
      const inputData: JoinDto = {
        email: 'test@email.com',
        userPw: 'q1w2e3r4!',
        userPwRe: 'q1w2e3r4!',
        userNick: 'tester',
        userLang: 1,
      };

      const server = app;

      await request(server).post('/auth/join').send(inputData).expect(201);
    });

    test('이메일 형식이 맞지 않음 | 404', async () => {
      const inputData: JoinDto = {
        email: randomString(),
        userPw: 'q1w2e3r4!',
        userPwRe: 'q1w2e3r4!',
        userLang: 1,
        userNick: 'tester',
      };

      const server = app;

      await request(server).post('/auth/join').send(inputData).expect(400);
    });

    test('중복된 이메일 | 409', async () => {
      const inputData: JoinDto = {
        email: 'test@email.com',
        userPw: 'q1w2e3r4!',
        userPwRe: 'q1w2e3r4!',
        userLang: 1,
        userNick: 'tester',
      };

      const server = app;

      await request(server).post('/auth/join').send(inputData).expect(409);
    });

    test('비밀번호 미일치 | 400', async () => {
      const inputData: JoinDto = {
        email: 'test1234@email.com',
        userPw: 'q1w2e3r4!!!!',
        userPwRe: 'q1w2e3r4!',
        userLang: 1,
        userNick: 'tester',
      };

      const server = app;

      await request(server).post('/auth/join').send(inputData).expect(400);
    });

    test('필수 데이터 누락 | 409', () => {
      const inputData: any = {
        email: randomString() + '@email.com',
        userPw: 'q1w2e3r4!',
        userPwRe: 'q1w2e3r4!',
        // userLang: 1,
        userNick: 'tester',
      };

      const server = app;

      return request(server).post('/auth/join').send(inputData);
    });
  });

  // describe('로그인', () => {
  //   describe('일반 로그인', () => {
  //     test('성공 | 200', async () => {

  //     })

  //     test('이메일이 존재하지 않음 | 400', async () => {

  //     })

  //     test('비밀번호가 일치하지 않음 | 400', async () => {

  //     })
  //   })

  //   describe('SNS 로그인', () => {
  //     test('성공 | 200', async () => {

  //     })

  //     test('데이터 누락 | 400', async () => {

  //     })
  //   })
  // })

  //   describe('POST /login', () => {
  //     test('response should have the Set-Cookie header with the Authorization token', async () => {
  //       const userData: JoinDto = {
  //         email: 'test@email.com',
  //         password: 'q1w2e3r4!',
  //       };
  //       process.env.JWT_SECRET = 'jwt_secret';

  //       const authRoute = new AuthRoute();

  //       authRoute.authController.authService.users.findOne = jest.fn().mockReturnValue(
  //         Promise.resolve({
  //           _id: 0,
  //           email: 'test@email.com',
  //           password: await bcrypt.hash(userData.password, 10),
  //         })
  //       );

  //       (mongoose as JoinDto).connect = jest.fn();
  //       const app = new server([authRoute]);
  //       return request(app.getServer())
  //         .post('/login')
  //         .send(userData)
  //         .expect('Set-Cookie', /^Authorization=.+/);
  //     });
  //   });

  //   describe('POST /logout', () => {
  //     test('logout Set-Cookie Authorization=; Max-age=0', () => {
  //       const authRoute = new AuthRoute();

  //       const app = new server([authRoute]);
  //       return request(app.getServer())
  //         .post('/logout')
  //         .expect('Set-Cookie', /^Authorization=\;/);
  //     });
  //   });
  // });

  // describe('Testing AuthService', () => {
  //   describe('when creating a cookie', () => {
  //     test('should return a string', () => {
  //       const tokenData: TokenData = {
  //         token: '',
  //         expiresIn: 1,
  //       };

  //       const authService = new AuthService();

  //       expect(typeof authService.createCookie(tokenData)).toEqual('string');
  //     });
  //   });

  //   describe('when registering a user', () => {
  //     describe('if the email is already token', () => {
  //       test('should throw an error', async () => {
  //         const userData: JoinDto = {
  //           email: 'test@email.com',
  //           password: 'q1w2e3r4!',
  //         };

  //         const authService = new AuthService();

  //         authService.users.findOne = jest.fn().mockReturnValue(Promise.resolve(userData));

  //         await expect(authService.signup(userData)).rejects.toMatchObject(
  //           new HttpException(400, `JoinDto with email ${userData.email} already exists`)
  //         );
  //       });
  //     });

  //     describe('if the email is not token', () => {
  //       test('should not throw an error', async () => {
  //         const userData: JoinDto = {
  //           email: 'test@email.com',
  //           password: 'q1w2e3r4!',
  //         };
  //         process.env.JWT_SECRET = 'jwt_secret';

  //         const authService = new AuthService();

  //         authService.users.findOne = jest.fn().mockReturnValue(Promise.resolve(undefined));

  //         authService.users.create = jest.fn().mockReturnValue({ _id: 0, ...userData });

  //         await expect(authService.signup(userData)).resolves.toBeDefined();
  //       });
  //     });
  //   });
});
