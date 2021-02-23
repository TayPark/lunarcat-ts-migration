import { User } from '../interfaces/users.interface';
import jwt from 'jsonwebtoken';

export const jwtTokenMaker = (userData: Partial<User>, SECRET_KEY: string, EXPIRES_IN: string) => {
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
