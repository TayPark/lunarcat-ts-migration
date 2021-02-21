import mongoose from 'mongoose';
import request from 'supertest';

import app from '../../../src/app';
import HttpException from '../../../src/lib/httpException';
import { connectDatabase } from '../../../src/lib/database';

beforeAll(async () => {
  await connectDatabase();
});

afterAll(() => {
  mongoose.connection.close();
});

describe('/auth', () => {
  describe('회원가입', () => {
    test('가입한 회원의 데이터를 반환', async () => {
      const inputData: any = {
        email: 'test@email.com',
        userPw: 'q1w2e3r4!',
        userPwRe: 'q1w2e3r4!',
        userNick: 'tester',
        userLang: 1,
      };
      
      const server = app;

      await request(server).post('/auth/join').send(inputData).expect(201);
    });

    test('중복된 이메일 | 409', async () => {
      const inputData: any = {
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
      const inputData: any = {
        email: 'test1234@email.com',
        userPw: 'q1w2e3r4!!!!',
        userPwRe: 'q1w2e3r4!',
        userLang: 1,
        userNick: 'tester',
      };

      const server = app;

      await request(server).post('/auth/join').send(inputData).expect(400);
    });

    test('데이터 누락', () => {
      const inputData: any = {
        email: 'test@email.com',
        userPw: 'q1w2e3r4!',
        userPwRe: 'q1w2e3r4!',
        // userLang: 1,
        userNick: 'tester',
      }

      const server = app;

      return request(server).post('/auth/join').send(inputData);
    });
  });

  describe('로그인', () => {

  })
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

//       (mongoose as any).connect = jest.fn();
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
