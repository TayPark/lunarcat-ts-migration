import 'dotenv/config';
import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { UserTokenDto } from '../dtos/users.dto';
import { UnauthorizedException } from '../lib/exceptions';
import { jwtTokenVerifier } from '../lib/authToken';
import HttpException from '../lib/httpException';

// 예외 페이지들에 대한 route stack의 마지막 async function의 이름을 저장합니다.
const authExceptions = [
  'getBoards', // 메인 페이지
  'viewBoard', // 뷰어 페이지
  'getReplys', // 대댓글 페이지
  'search', // 검색 페이지
  'getMyboard', // 마이보드 페이지
  'bookmarks',
  'secondaryWorks',
  'originals',
  'allWorks', // 마이보드 페이지 끝
  'getReplys', // 대댓글 확인
];

/**
 * @description JWT토큰으로 유저 인증 수행
 * @param {*} req HTTP request
 * @param {*} res HTTP response
 * @param {*} next ExpressJS middleware
 */
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { access_token: clientToken } = req.cookies;

    const { name: accessPath } = req.route.stack[req.route.stack.length - 1];

    if (!clientToken && authExceptions.includes(accessPath)) {
      // 비회원에게 접근이 허용된 페이지
      return next();
    }

    /* 나머지 기능들에 대해 요청받은 토큰을 검사
        비회원에게 접근이 허용된 페이지의 경우에는 유저의 로그인 상태에 따라 다르게 보이기 위해 필요
    */

    const tokenSchema = Joi.object({
      token: Joi.string()
        .regex(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/)
        .required(),
    });

    try {
      await tokenSchema.validateAsync({ token: clientToken });
    } catch (e) {
      return next(
        new UnauthorizedException(
          `Not a token ${clientToken} from ${
            req.headers['x-forwarded-for'] || req.socket.remoteAddress
          }`
        )
      );
    }

    let decoded: string | object;

    try {
      decoded = await jwtTokenVerifier(clientToken);
    } catch (e) {
      console.log(
        `[INFO] 인증 실패: 손상된 토큰을 사용하였습니다. ip: ${
          req.headers['x-forwarded-for'] || req.socket.remoteAddress
        } token: ${clientToken}`
      );
      return next(new UnauthorizedException(`Broken access token ${clientToken} from ${
        req.headers['x-forwarded-for'] || req.socket.remoteAddress
      }`));
    }

    if (decoded) {
      if ((decoded as UserTokenDto).isConfirmed) {
        res.locals.user = (decoded as UserTokenDto);
        next();
      } else {
        console.log(
          `[INFO] 인증 실패: 유저 ${(decoded as UserTokenDto)._id} 가 로그인을 시도했으나 이메일 인증이 완료되지 않았습니다.`
        );
        return next(new UnauthorizedException('User email is not verified'));
      }
    } else {
      console.log(
        `[INFO] 인증 실패: 유저 ${
          req.headers['x-forwarded-for'] || req.socket.remoteAddress
        } 가 로그인을 시도했으나 토큰의 유효기간이 만료되었거나 토큰이 없습니다.`
      );
      return next(new UnauthorizedException('Unauthorized token'));
    }
  } catch (e) {
    console.error(`[ERROR] ${e}`);
    return next(new HttpException('Unknown exception'));
  }
};
