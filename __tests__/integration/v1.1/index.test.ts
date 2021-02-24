import app from '../../../src/app';
import request from 'supertest';

beforeEach(() => {
  // reference error 방지
  jest.useFakeTimers();
});

describe('/', () => {
  test('서버 동작 | 200', async () => {
    await request(app).get('/').expect(200);
  });
});
