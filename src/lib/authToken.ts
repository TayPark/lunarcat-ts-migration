import { UserEntity } from '../domains/users.entity';
import jwt from 'jsonwebtoken';

export const jwtTokenMaker = (userData: Partial<UserEntity>, SECRET_KEY: string, EXPIRES_IN: string) => {
  return jwt.sign(
    {
      nick: userData.nickname,
      uid: userData._id,
      isConfirmed: userData.isConfirmed,
      screenId: userData.screenId,
    },
    SECRET_KEY,
    {
      expiresIn: EXPIRES_IN,
    }
  );
};
