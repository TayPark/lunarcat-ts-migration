import axios from 'axios';
import crypto from 'crypto';
import util from 'util';
import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';

import {
  JoinDto,
  LoginDto,
  GoogleLoginDto,
  ChangePasswordDto,
  SnsLoginDto,
  SnsJoinDto,
  FacebookLoginDto,
} from '../dtos/users.dto';
import AuthService from '../services/auth.service';
import transporter, { emailText, findPassText } from '../lib/sendMail';
import { UserEntity } from '../domains/users.entity';
import HttpException from '../lib/httpException';
import { logger } from '../configs/winston';
import IntResponse from '../lib/response';
import MongoAuthRepository from '../repositories/mongo.auth.repo';
import { BadRequestException, ForbiddenException, NotFoundException } from '../lib/exceptions';
import { jwtTokenMaker } from '../lib/authToken';
import { SnsType } from '../dtos/global.enums';

class AuthController {
  public authService: AuthService = new AuthService(new MongoAuthRepository());

  private SECRET_KEY = process.env.SECRET_KEY;
  private MAIL_USER = process.env.MAIL_USER;
  private randomBytes = util.promisify(crypto.randomBytes);

  /**
   * @description 회원가입
   * @since 2021.02.17 ~
   * @author taypark
   * @route POST /auth/join
   */
  public join = async (req: Request, res: Response, next: NextFunction) => {
    const userData: JoinDto = req.body;

    // input validation
    try {
      const joinSchema = Joi.object({
        email: Joi.string()
          .regex(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i)
          .required(),
        userPw: Joi.string().required(),
        userPwRe: Joi.string().required(),
        userNick: Joi.string().trim().required(),
        userLang: Joi.number().required(),
      });

      await joinSchema.validateAsync(userData);
    } catch (e) {
      return next(new BadRequestException(`Validation falied: ${e}`));
    }

    const userPassRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/.test(
      userData.userPw
    );

    try {
      if (userPassRegex) {
        const { email: userEmail, token: authToken } = await this.authService.createUser(userData);

        if (authToken) {
          const mailOption = {
            from: this.MAIL_USER,
            to: userEmail,
            subject: '이메일 인증을 완료해주세요.',
            html: emailText(userEmail, authToken),
          };

          try {
            transporter.sendMail(mailOption);
            logger.info(`Sended mail to ${userEmail}`);
            IntResponse(res, 201, {}, 'Mail sent');
          } catch (e) {
            next(
              new HttpException(
                `Failed to send mail for ${userEmail} when processing ${req.originalUrl}`
              )
            );
          }
        }
      } else {
        next(new BadRequestException('Check password rule'));
      }
    } catch (e) {
      next(e);
    }
  };

  /**
   * @description 로그인
   * @since 2021.02.18 ~
   * @author taypark
   * @access POST /auth/login
   */
  public login = async (req: Request, res: Response, next: NextFunction) => {
    const userData: LoginDto = req.body;

    try {
      const targetUser: UserEntity = await this.authService.login(userData.email, userData.userPw);

      const authToken: string = await jwtTokenMaker(targetUser);

      const responseData = {
        authToken,
        nick: targetUser.nickname,
        screenId: targetUser.screenId,
        displayLanguage: targetUser.screenId,
      };

      res.cookie('access_token', authToken, {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ? true : false,
        domain: process.env.NODE_ENV === 'production' ? '.epiclogue.com' : 'localhost',
      })
      IntResponse(res, 200, responseData);
    } catch (e) {
      next(e);
    }
  };

  // public logout = async (req: Request, res: Response, next: NextFunction) => {};

  /**
   * @description SNS 로그인
   * @since 2021.02.18 ~
   * @author taypark
   * @access POST /auth/snsLogin
   */
  public snsLogin = async (req: Request, res: Response, next: NextFunction) => {
    const inputData: SnsLoginDto = req.body;

    let snsId: string;
    const { snsType }: { snsType: string } = inputData;

    if (snsType === SnsType.GOOGLE) {
      snsId = (inputData.snsData as GoogleLoginDto).profileObj.googleId;
    } else if (snsType === SnsType.FACEBOOK) {
      snsId = (inputData.snsData as FacebookLoginDto).id;
    } else {
      return next(new BadRequestException(`We don\'t support SNS login type: ${snsType}`));
    }

    try {
      let findUser: UserEntity = await this.authService.findBySnsId(snsId, snsType);

      if (findUser && findUser.deactivatedAt !== null) {
        return next(new ForbiddenException('Deactivated account'));
      }

      // 유저가 없으므로 회원가입
      if (!findUser) {
        let dataForSnsJoin: SnsJoinDto | any;
        if (snsType === SnsType.GOOGLE) {
          dataForSnsJoin = {
            uid: (inputData.snsData as GoogleLoginDto).profileObj.googleId,
            email: (inputData.snsData as GoogleLoginDto).profileObj.email,
            profile: (inputData.snsData as GoogleLoginDto).profileObj.imageUrl,
            name: (inputData.snsData as GoogleLoginDto).profileObj.name,
            displayLanguage: inputData.userLang,
            snsType,
          };
        } else if (snsType === SnsType.FACEBOOK) {
          dataForSnsJoin = {
            uid: (inputData.snsData as FacebookLoginDto).id,
            email: (inputData.snsData as FacebookLoginDto).email,
            profile: (await this.getFbProfile(snsId)) || null,
            name: (inputData.snsData as FacebookLoginDto).name,
            displayLanguage: inputData.userLang,
            snsType,
          };
        }

        findUser = await this.authService.createSnsUser(dataForSnsJoin);
      }

      const authToken: string = await jwtTokenMaker(findUser);

      const responseData = {
        token: authToken,
        nick: findUser.nickname,
        screenId: findUser.screenId,
        displayLanguage: findUser.screenId,
      };

      res.cookie('access_token', authToken, {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ? true : false,
        domain: process.env.NODE_ENV === 'production' ? '.epiclogue.com' : 'localhost',
      })

      IntResponse(res, 200, responseData);
    } catch (e) {
      next(e);
    }
  };

  /**
   * @description 비밀번호 변경을 위한 인증 이메일 발송
   * @since 2021.02.18 ~
   * @author taypark
   * @access POST /auth/findPass
   */
  public sendMailToFindPassword = async (req: Request, res: Response, next: NextFunction) => {
    const email: string = req.body.email;

    const targetUser: UserEntity = await this.authService.findByEmail(email);

    if (!targetUser) {
      next(new NotFoundException('User not found'));
    }

    const userToken = await (await this.randomBytes(24)).toString('hex');
    const option = {
      from: this.MAIL_USER,
      to: email,
      subject: '비밀번호 재설정을 위해 이메일 인증을 완료해주세요!',
      html: findPassText(email, userToken),
    };

    try {
      await this.authService.updateUser(targetUser._id, { token: userToken });
      transporter.sendMail(option);
      IntResponse(res, 200, {}, 'Find account mail sent');
    } catch (e) {
      next(e);
    }
  };

  /**
   * @description 비밀번호 변경
   * @since 2021.02.18 ~
   * @author taypark
   * @access PATCH /auth/findPass
   */
  public changePassword = async (req: Request, res: Response, next: NextFunction) => {
    const inputData: ChangePasswordDto = req.body;

    if (inputData.userPwNew !== inputData.userPwNewRe) {
      next(new BadRequestException("New password doesn't match"));
    }

    const userPassRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/.test(
      inputData.userPwNew
    );

    try {
      if (userPassRegex) {
        await this.authService.changePassword(inputData.email, inputData.userPwNew);
        IntResponse(res, 200, {}, 'Password changed');
      } else {
        next(new BadRequestException('Check password rule'));
      }
    } catch (e) {
      next(e);
    }
  };

  /**
   * @description 이메일 인증
   * @since 2021.02.18 ~
   * @author taypark
   * @access GET /auth/mailAuth
   */
  public mailAuth = async (req: Request, res: Response, next: NextFunction) => {
    const { email, token } = req.query as { [k in string] };

    try {
      await this.authService.confirmUser(email, token);
      IntResponse(res, 200);
    } catch (e) {
      next(e);
    }
  };

  private getFbProfile = async facebookId => {
    try {
      const fbProfileImage = await axios({
        url: `https://graph.facebook.com/v9.0/${facebookId}/picture`,
        method: 'GET',
      });

      return fbProfileImage;
    } catch (e) {
      console.error(`Getting profile for facebook failed`);
      throw new BadRequestException(e);
    }
  };
}

export default AuthController;
