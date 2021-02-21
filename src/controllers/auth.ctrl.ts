import axios from 'axios';
import crypto from 'crypto';
import util from 'util';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';

import {
  JoinDto,
  LoginDto,
  GoogleLoginDto,
  ChangePasswordDto,
  SnsLoginDto,
} from '../dtos/users.dto';
import AuthService from '../services/auth.service';
import transporter, { emailText, findPassText } from '../lib/sendMail';
import { User } from '../interfaces/users.interface';
import HttpException from '../lib/httpException';
import { logger } from '../configs/winston';
import IntResponse from '../lib/response';

class AuthController {
  public authService: AuthService = new AuthService();

  private SECRET_KEY = process.env.SECRET_KEY;
  private EXEC_NUM = parseInt(process.env.EXEC_NUM, 10);
  private RESULT_LENGTH = parseInt(process.env.RESULT_LENGTH, 10);
  private JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
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

    const userPassRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/.test(
      userData.userPw
    );

    try {
      if (userPassRegex) {
        if (userData.userPw === userData.userPwRe) {
          if (!(await this.authService.findByEmail(userData.email))) {
            const generatedId: string = crypto
              .createHash('sha256')
              .update(userData.email)
              .digest('hex')
              .slice(0, 14);
            const salt: string = await (await this.randomBytes(64)).toString('base64');
            const cryptedPassword: Buffer = crypto.pbkdf2Sync(
              userData.userPw,
              salt,
              this.EXEC_NUM,
              this.RESULT_LENGTH,
              'sha512'
            );
            const authToken = cryptedPassword.toString('hex').slice(0, 24);
            const createUser = await this.authService.createUser({
              email: userData.email,
              nickname: userData.userNick,
              screenId: generatedId,
              password: cryptedPassword.toString('base64'),
              salt,
              token: authToken,
              displayLanguage: parseInt(userData.userLang, 10),
            });

            if (createUser) {
              const mailOption = {
                from: this.MAIL_USER,
                to: userData.email,
                subject: '이메일 인증을 완료해주세요.',
                html: emailText(userData.email, authToken),
              };

              try {
                transporter.sendMail(mailOption);
                logger.info(`Sended mail to ${userData.email}`);
                IntResponse(res, 201, {}, 'Mail sent');
              } catch (e) {
                next(
                  new HttpException(
                    500,
                    `Failed to send mail for ${userData.email} when processing ${req.originalUrl}`
                  )
                );
              }
            }
          } else {
            next(new HttpException(409, 'Duplicated email'));
          }
        } else {
          next(new HttpException(400, 'Passwords are not matched'));
        }
      } else {
        next(new HttpException(400, 'Check password rule'));
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
      const targetUser: User = await this.authService.findByEmail(userData.email);

      if (targetUser.deactivatedAt !== null) {
        next(new HttpException(409, 'Deactivated account'));
      }

      const cryptedPassword: Buffer = crypto.pbkdf2Sync(
        userData.userPw,
        targetUser.salt,
        this.EXEC_NUM,
        this.RESULT_LENGTH,
        'sha512'
      );

      if (targetUser.password === cryptedPassword.toString('base64')) {
        const authToken = jwt.sign(
          {
            nick: targetUser.nickname,
            uid: targetUser._id,
            isConfirmed: targetUser.isConfirmed,
          },
          this.SECRET_KEY,
          {
            expiresIn: this.JWT_EXPIRES_IN,
          }
        );

        const responseData = {
          result: 'ok',
          authToken,
          nick: targetUser.nickname,
          screenId: targetUser.screenId,
          displayLanguage: targetUser.screenId,
        };

        IntResponse(res, 200, responseData);
      } else {
        next(new HttpException(400, 'Check your id and password'));
      }
    } catch (e) {
      next(new HttpException(500, `Unknown server error: ${e}`));
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

    const snsLoginData =
      inputData.snsData instanceof GoogleLoginDto
        ? {
            uid: inputData.snsData.profileObj.googleId,
            email: inputData.snsData.profileObj.email,
            profile: inputData.snsData.profileObj.imageUrl,
            name: inputData.snsData.profileObj.name,
          }
        : {
            uid: inputData.snsData.id,
            email: inputData.snsData.email,
            profile: await this.getFbProfile(inputData.snsData.id),
            name: inputData.snsData.name,
          };

    try {
      let findUser: User = await this.authService.findById(snsLoginData.uid);

      if (!findUser) {
        const generateId: string = crypto
          .createHash('sha256')
          .update(snsLoginData.email)
          .digest('hex')
          .slice(0, 14);

        const salt: string = await (await this.randomBytes(64)).toString('base64');

        const cryptedPassword: string = await crypto
          .pbkdf2Sync(snsLoginData.email, salt, this.EXEC_NUM, this.RESULT_LENGTH, 'sha512')
          .toString('base64');

        findUser = await this.authService.createUser({
          email: snsLoginData.email,
          password: cryptedPassword,
          salt,
          nickname: snsLoginData.name,
          token: null, // SNS으로 이미 인증된 계정이므로 mail auth를 위한 token을 null로 처리
          screenId: generateId,
          displayLanguage: parseInt(inputData.userLang, 10),
          profile: snsLoginData.profile,
          snsId: snsLoginData.uid,
          snsType: inputData.snsType,
          isConfirmed: true,
        });
      }

      if (findUser.deactivatedAt !== null) {
        next(new HttpException(404, 'Deactivated account'));
      }

      const authToken = jwt.sign(
        {
          nick: findUser.nickname,
          uid: findUser._id,
          isConfirmed: findUser.isConfirmed,
        },
        this.SECRET_KEY,
        {
          expiresIn: this.JWT_EXPIRES_IN,
        }
      );

      const responseData = {
        token: authToken,
        nick: findUser.nickname,
        screenId: findUser.screenId,
        displayLanguage: findUser.screenId,
      };

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

    const targetUser: User = await this.authService.findByEmail(email);

    if (!targetUser) {
      next(new HttpException(404, 'User not found'));
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
      next(new HttpException(400, "New password doesn't match"));
    }

    const userPassRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/.test(
      inputData.userPwNew
    );

    try {
      if (userPassRegex) {
        const targetUser: User = await this.authService.findByEmail(inputData.email);

        if (targetUser) {
          const newSalt: string = await (await this.randomBytes(64)).toString('base64');
          const newPassword: string = await (
            await crypto.pbkdf2Sync(
              inputData.userPwNew,
              newSalt,
              this.EXEC_NUM,
              this.RESULT_LENGTH,
              'sha512'
            )
          ).toString('base64');

          await this.authService.updateUser(targetUser._id, {
            salt: newSalt,
            password: newPassword,
          });

          IntResponse(res, 200, {}, 'Password changed');
        } else {
          next(new HttpException(400, `User ${inputData.email} not found`));
        }
      } else {
        next(new HttpException(400, 'Check password rule'));
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
      const findUser: User = await this.authService.confirmUser(email, token);

      if (!findUser) {
        throw new HttpException(404, 'User not found');
      }

      IntResponse(res, 200);
    } catch (e) {
      next(e);
    }
  };

  private getFbProfile = async uid => {
    try {
      const fbProfileImage = await axios({
        url: `https://graph.facebook.com/v9.0/${uid}/picture`,
        method: 'GET',
      });

      return fbProfileImage;
    } catch (e) {
      throw new Error(e);
    }
  };
}

export default AuthController;