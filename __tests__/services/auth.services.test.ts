import { User } from '../../src/interfaces/users.interface';
import AuthService from '../../src/services/auth.service';

jest.mock('../../src/services/auth.service');

beforeAll(() => {});

const authService: AuthService = new AuthService();

describe('인증 서비스', () => {
  describe('기본 CRUD', () => {
    describe('유저 생성', () => {
      it('성공 | 200', async () => {
        const createUserData = {
          email: 'test@gmail.com',
          userPw: '1q2w3e4r!',
          userPwRe: '1q2w3e4r!',
          userLang: 1,
          userNick: 'tester',
        };

        const result = await (new AuthService()).createUser(createUserData);

        console.log(result);

        expect(result).toBeInstanceOf(User)
      });
    });
  });
});
