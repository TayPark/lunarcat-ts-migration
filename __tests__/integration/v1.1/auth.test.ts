import request from 'supertest';
import jwt from 'jsonwebtoken';

import app from '../../../src/app';
import { connectDatabase, dropDatabase } from '../../../src/lib/database';
import randomString from 'random-string';
import { JoinDto } from '../../../src/dtos/users.dto';
import AuthService from '../../../src/services/auth.service';
import MongoAuthRepository from '../../../src/repositories/mongo.auth.repo';
import { User } from '../../../src/interfaces/users.interface';

beforeAll(async () => {
  await connectDatabase();
});

afterAll(async () => {
  await dropDatabase();
});

describe('/auth', () => {
  const authService: AuthService = new AuthService(new MongoAuthRepository());

  describe('회원가입', () => {
    test('회원가입 성공 | 201', async () => {
      const inputData: JoinDto = {
        email: 'test@email.com',
        userPw: 'q1w2e3r4!',
        userPwRe: 'q1w2e3r4!',
        userNick: 'tester',
        userLang: 1,
      };

      await request(app).post('/auth/join').send(inputData).expect(201);
    });

    test('이메일 형식이 맞지 않음 | 404', async () => {
      const inputData: JoinDto = {
        email: randomString(),
        userPw: 'q1w2e3r4!',
        userPwRe: 'q1w2e3r4!',
        userLang: 1,
        userNick: 'tester',
      };

      await request(app).post('/auth/join').send(inputData).expect(400);
    });

    test('중복된 이메일 | 409', async () => {
      const inputData: JoinDto = {
        email: 'test@email.com',
        userPw: 'q1w2e3r4!',
        userPwRe: 'q1w2e3r4!',
        userLang: 1,
        userNick: 'tester',
      };

      await request(app).post('/auth/join').send(inputData).expect(409);
    });

    test('비밀번호 미일치 | 400', async () => {
      const inputData: JoinDto = {
        email: 'test1234@email.com',
        userPw: 'q1w2e3r4!!!!',
        userPwRe: 'q1w2e3r4!',
        userLang: 1,
        userNick: 'tester',
      };

      await request(app).post('/auth/join').send(inputData).expect(400);
    });

    test('필수 데이터 누락 | 409', () => {
      const inputData: any = {
        email: randomString() + '@email.com',
        userPw: 'q1w2e3r4!',
        userPwRe: 'q1w2e3r4!',
        // userLang: 1,
        userNick: 'tester',
      };

      return request(app).post('/auth/join').send(inputData);
    });
  });

  describe('로그인', () => {
    describe('일반 로그인', () => {
      test('성공 | 200', async () => {
        const inputData: JoinDto = {
          email: randomString() + '@email.com',
          userPw: 'q1w2e3r4!',
          userPwRe: 'q1w2e3r4!',
          userLang: 1,
          userNick: 'tester',
        };

        await request(app).post('/auth/join').send(inputData).expect(201);
        const createUser: User = await authService.findByEmail(inputData.email);
        await request(app)
          .post('/auth/mailAuth')
          .send({ email: inputData.email, token: createUser.token });
        await request(app).post('/auth/login').send(inputData).expect(200);
      });

      test('이메일이 인증되지 않음', async () => {
        const inputData: JoinDto = {
          email: randomString() + '@email.com',
          userPw: 'q1w2e3r4!',
          userPwRe: 'q1w2e3r4!',
          userLang: 1,
          userNick: 'tester',
        };

        await request(app).post('/auth/join').send(inputData).expect(201);

        const loginResponse = await request(app).post('/auth/login').send(inputData);
        const { authToken } = loginResponse.body.data;
        const decoded: any = await jwt.verify(authToken, process.env.SECRET_KEY);

        expect(decoded.isConfirmed).toBeFalsy();
      });

      test('계정이 존재하지 않음 | 400', async () => {
        await request(app)
          .post('/auth/login')
          .send({ email: randomString(), userPw: randomString() })
          .expect(400);
      });

      // test('비밀번호가 일치하지 않음 | 400', async () => {
      //   const inputData: JoinDto = {
      //     email: randomString() + '@email.com',
      //     userPw: 'q1w2e3r4!',
      //     userPwRe: 'q1w2e3r4!',
      //     userLang: 1,
      //     userNick: 'tester',
      //   };

      //   await request(app).post('/auth/join').send(inputData).expect(201);
      //   await request(app)
      //     .post('/auth/login')
      //     .send({ email: inputData.email, userPw: randomString() })
      //     .expect(400);
      // });

      describe('SNS 로그인', () => {
        test('성공 | 200', async () => {});

        test('데이터 누락 | 400', async () => {});
      });
    });

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
    //       const app = new app([authRoute]);
    //       return request(app.getapp())
    //         .post('/login')
    //         .send(userData)
    //         .expect('Set-Cookie', /^Authorization=.+/);
    //     });
    //   });

    //   describe('POST /logout', () => {
    //     test('logout Set-Cookie Authorization=; Max-age=0', () => {
    //       const authRoute = new AuthRoute();

    //       const app = new app([authRoute]);
    //       return request(app.getapp())
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
  });
});
