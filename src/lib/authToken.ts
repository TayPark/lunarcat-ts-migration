import 'dotenv/config';
import { UserEntity } from '../domains/users.entity';
import jwt from 'jsonwebtoken';

const { JWT_EXPIRES_IN, SECRET_KEY } = process.env;

export const jwtTokenMaker = async (userData: Partial<UserEntity>): Promise<string> => {
  return jwt.sign(
    {
      _id: userData._id,
      nickname: userData.nickname,
      screenId: userData.screenId,
      isConfirmed: userData.isConfirmed,
    },
    SECRET_KEY,
    {
      expiresIn: JWT_EXPIRES_IN,
      // algorithm: 'HS512',
    }
  );
};

export const jwtTokenVerifier = async (clientToken: string): Promise<string | object> => {
  return jwt.verify(clientToken, SECRET_KEY
    // , { algorithms: ['HS512'] }
  );
};
