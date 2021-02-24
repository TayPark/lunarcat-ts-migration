import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import randomString from 'random-string';

import app from '../../../src/app';
import { connectDatabase } from '../../../src/lib/database';
import { JoinDto } from '../../../src/dtos/users.dto';
import AuthService from '../../../src/services/auth.service';
import MongoAuthRepository from '../../../src/repositories/mongo.auth.repo';
import { User } from '../../../src/interfaces/users.interface';
import { BadRequestException, NotFoundException } from '../../../src/lib/exceptions';

beforeAll(async () => {
  await connectDatabase();
});

afterAll(async () => {
  mongoose.connection.close();
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

    test('중복된 이메일 | 400', async () => {
      const inputData: JoinDto = {
        email: 'test@email.com',
        userPw: 'q1w2e3r4!',
        userPwRe: 'q1w2e3r4!',
        userLang: 1,
        userNick: 'tester',
      };

      await request(app).post('/auth/join').send(inputData).expect(400);
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

    test('필수 데이터 누락 | 400', () => {
      const inputData: Partial<JoinDto> = {
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

      test('계정이 존재하지 않음 | 404', async () => {
        await request(app)
          .post('/auth/login')
          .send({ email: randomString(), userPw: randomString() })
          .expect(404);
      });

      test('비밀번호가 일치하지 않음 | 400', async () => {
        const inputData: JoinDto = {
          email: randomString() + '@email.com',
          userPw: 'q1w2e3r4!',
          userPwRe: 'q1w2e3r4!',
          userLang: 0,
          userNick: 'tester',
        };

        await request(app).post('/auth/join').send(inputData).expect(201);

        await request(app)
          .post('/auth/login')
          .send({ email: inputData.email, userPw: randomString() })
          .expect(400);
      });
    });

    describe('SNS 로그인', () => {
      // test('성공 | 200', async () => {});
      // test('데이터 누락 | 400', async () => {});
    });

    describe('비밀번호 변경', () => {
      describe('비밀번호 변경을 위한 메일 발송', () => {
        
      })
      // describe('비밀번호 변경', () => {})
    });

    describe('메일 인증', () => {
      test('성공 | 200', async () => {
        const inputData: JoinDto = {
          email: randomString() + '@email.com',
          userPw: 'q1w2e3r4!',
          userPwRe: 'q1w2e3r4!',
          userLang: 0,
          userNick: 'tester',
        };

        await request(app).post('/auth/join').send(inputData).expect(201);
        const findUser: User = await authService.findByEmail(inputData.email);

        await request(app)
          .get(`/auth/mailAuth?email=${inputData.email}&token=${findUser.token}`)
          .expect(200);
      });

      test('실패: 메일이 존재하지 않음 | 404', async () => {
        try {
          await request(app).get(`/auth/mailAuth?email=${randomString()}&token=${randomString()}`);
        } catch (e) {
          expect(e).toBeInstanceOf(NotFoundException);
        }
      });

      test('실패: 토큰이 일치하지 않음 | 404', async () => {
        const inputData: JoinDto = {
          email: randomString() + '@email.com',
          userPw: 'q1w2e3r4!',
          userPwRe: 'q1w2e3r4!',
          userLang: 0,
          userNick: 'tester',
        };
  
        await request(app).post('/auth/join').send(inputData).expect(201);
  
        try {
          await request(app).get(`/auth/mailAuth?email=${inputData.email}&token=${randomString()}`);
        } catch (e) {
          expect(e).toBeInstanceOf(BadRequestException);
        }
      });
    });
  });
});
