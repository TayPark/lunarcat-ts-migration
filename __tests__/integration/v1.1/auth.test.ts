import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import randomString from 'random-string';

import app from '../../../src/app';
import { connectDatabase } from '../../../src/lib/database';
import { ChangePasswordDto, JoinDto, SnsLoginDto } from '../../../src/dtos/users.dto';
import AuthService from '../../../src/services/auth.service';
import MongoAuthRepository from '../../../src/repositories/mongo.auth.repo';
import { User } from '../../../src/interfaces/users.interface';
import { BadRequestException, NotFoundException } from '../../../src/lib/exceptions';
import { SnsType } from '../../../src/dtos/global.enums';

beforeAll(async () => {
  await connectDatabase();
});

beforeEach(() => {
  // reference error 방지
  jest.useFakeTimers();
});

afterAll(async () => {
  mongoose.connection.close();
});

describe('/auth', () => {
  const authService: AuthService = new AuthService(new MongoAuthRepository());

  describe('POST /auth/join 회원가입', () => {
    test('성공 | 201', async () => {
      const inputData: JoinDto = {
        email: 'test@email.com',
        userPw: 'q1w2e3r4!',
        userPwRe: 'q1w2e3r4!',
        userNick: 'tester',
        userLang: 1,
      };

      await request(app).post('/auth/join').send(inputData).expect(201);
    });

    test('실패: 이메일 형식이 맞지 않음 | 404', async () => {
      const inputData: JoinDto = {
        email: randomString(),
        userPw: 'q1w2e3r4!',
        userPwRe: 'q1w2e3r4!',
        userLang: 1,
        userNick: 'tester',
      };

      try {
        await request(app).post('/auth/join').send(inputData);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });

    test('실패: 중복된 이메일 | 400', async () => {
      const inputData: JoinDto = {
        email: 'test@email.com',
        userPw: 'q1w2e3r4!',
        userPwRe: 'q1w2e3r4!',
        userLang: 1,
        userNick: 'tester',
      };

      try {
        await request(app).post('/auth/join').send(inputData);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });

    test('실패: 비밀번호 미일치 | 400', async () => {
      const inputData: JoinDto = {
        email: 'test1234@email.com',
        userPw: 'q1w2e3r4!!!!',
        userPwRe: 'q1w2e3r4!',
        userLang: 1,
        userNick: 'tester',
      };

      try {
        await request(app).post('/auth/join').send(inputData);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });

    test('실패: 필수 데이터 누락 | 400', async () => {
      const inputData: Partial<JoinDto> = {
        email: randomString() + '@email.com',
        userPw: 'q1w2e3r4!',
        userPwRe: 'q1w2e3r4!',
        // userLang: 1,
        userNick: 'tester',
      };

      try {
        await request(app).post('/auth/join').send(inputData);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('POST /auth/login 로그인', () => {
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

      test('성공: 이메일이 인증되지 않음 | 200', async () => {
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

      test('실패: 계정이 존재하지 않음 | 404', async () => {
        try {
          await request(app)
            .post('/auth/login')
            .send({ email: randomString(), userPw: randomString() });
        } catch (e) {
          expect(e).toBeInstanceOf(NotFoundException);
        }
      });

      test('실패: 비밀번호가 일치하지 않음 | 400', async () => {
        const inputData: JoinDto = {
          email: randomString() + '@email.com',
          userPw: 'q1w2e3r4!',
          userPwRe: 'q1w2e3r4!',
          userLang: 0,
          userNick: 'tester',
        };

        await request(app).post('/auth/join').send(inputData).expect(201);

        try {
          await request(app)
            .post('/auth/login')
            .send({ email: inputData.email, userPw: randomString() })
            .expect(400);
        } catch (e) {
          expect(e).toBeInstanceOf(BadRequestException);
        }
      });
  });
  
  describe('POST /auth/snsLogin SNS 로그인', () => {
    test('성공 | 200', async () => {
      const snsLoginData: SnsLoginDto = {
        snsData: {
          profileObj: {
            googleId: '123456781251590',
            email: randomString() + '@email.com',
            imageUrl: 'some_image_url',
            name: 'snsLoginer'
          }
        },
        snsType: SnsType.GOOGLE,
        userLang: 0
      }
      
      await request(app).post('/auth/snsLogin').send(snsLoginData).expect(200);
    });

    // test('데이터 누락 | 400', async () => {});
  });

  describe('POST /auth/findPass 비밀번호 변경을 위한 메일 발송', () => {
    test('성공 | 200', async () => {
      const inputData: JoinDto = {
        email: randomString() + '@email.com',
        userPw: 'q1w2e3r4!',
        userPwRe: 'q1w2e3r4!',
        userLang: 0,
        userNick: 'tester',
      };

      await request(app).post('/auth/join').send(inputData).expect(201);
      
      const findUser: User = await authService.findByEmail(inputData.email)

      await request(app).post('/auth/findPass').send({ email: inputData.email }).expect(200);

      const findAfterEmailSent: User = await authService.findByEmail(inputData.email)

      expect(findUser.token).not.toEqual(findAfterEmailSent.token);
    });

    test('실패: 존재하지 않는 이메일 | 404', async () => {
      const inputData: JoinDto = {
        email: randomString() + '@email.com',
        userPw: 'q1w2e3r4!',
        userPwRe: 'q1w2e3r4!',
        userLang: 0,
        userNick: 'tester',
      };

      await request(app).post('/auth/join').send(inputData).expect(201);
      
      try {
        await request(app).post('/auth/findPass').send(randomString());
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException)
      }
    });
  });

  describe('PATCH /auth/findPass 비밀번호 변경', () => {
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
      const newPass: string = '1q2w3e4r!!'
      const newPassData: ChangePasswordDto = {
        email: inputData.email,
        userPwNew: newPass,
        userPwNewRe: newPass,
        token: findUser.token,
      };

      await request(app).patch('/auth/findPass').send(newPassData).expect(200);
    });

    test('실패: 존재하지 않는 이메일 | 400', async () => {
      const inputData: JoinDto = {
        email: randomString() + '@email.com',
        userPw: 'q1w2e3r4!',
        userPwRe: 'q1w2e3r4!',
        userLang: 0,
        userNick: 'tester',
      };

      await request(app).post('/auth/join').send(inputData).expect(201);

      const findUser: User = await authService.findByEmail(inputData.email);
      const newPass: string = randomString({ length: 5 });
      const newPassData: ChangePasswordDto = {
        email: randomString(),
        userPwNew: newPass,
        userPwNewRe: newPass,
        token: findUser.token,
      };

      try {
        await request(app).patch('/auth/findPass').send(newPassData);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });

    test('실패: 비밀번호 정규식 불합격 | 400', async () => {
      const inputData: JoinDto = {
        email: randomString() + '@email.com',
        userPw: 'q1w2e3r4!',
        userPwRe: 'q1w2e3r4!',
        userLang: 0,
        userNick: 'tester',
      };

      await request(app).post('/auth/join').send(inputData).expect(201);

      const findUser: User = await authService.findByEmail(inputData.email);
      const newPass: string = randomString({ length: 5 });
      const newPassData: ChangePasswordDto = {
        email: inputData.email,
        userPwNew: newPass,
        userPwNewRe: newPass,
        token: findUser.token,
      };

      try {
        await request(app).patch('/auth/findPass').send(newPassData);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });

    test('실패: 비밀번호 미일치 | 400', async () => {
      const inputData: JoinDto = {
        email: randomString() + '@email.com',
        userPw: 'q1w2e3r4!',
        userPwRe: 'q1w2e3r4!',
        userLang: 0,
        userNick: 'tester',
      };

      await request(app).post('/auth/join').send(inputData).expect(201);

      const findUser: User = await authService.findByEmail(inputData.email);
      const newPassData: ChangePasswordDto = {
        email: inputData.email,
        userPwNew: randomString({ length: 20 }),
        userPwNewRe: randomString({ length: 20 }),
        token: findUser.token,
      };

      try {
        await request(app).patch('/auth/findPass').send(newPassData);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('GET /auth/mailAuth 메일 인증', () => {
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

    test('실패: 토큰이 일치하지 않음 | 400', async () => {
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
