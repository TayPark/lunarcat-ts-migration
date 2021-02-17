import axios from 'axios';
import crypto from 'crypto';
import util from 'util';
import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';

import { CreateUserDto, LoginDto } from '../dtos/users.dto';
import AuthService from '../services/auth.service';
import transporter, { emailText, findPassText } from '../lib/sendMail';
import { User } from '../interfaces/users.interface';
import HttpException from '../lib/httpException';
import { logger } from '../configs/winston';
import { Http } from 'winston/lib/winston/transports';

export class AuthController {
  private authService: AuthService = new AuthService();

  private SECRET_KEY = process.env.SECRET_KEY;
  private EXEC_NUM = process.env.EXEC_NUM;
  private RESULT_LENGTH = process.env.RESULT_LENGTH;
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
    const userData: CreateUserDto = req.body;

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
            const salt: Buffer = await this.randomBytes(64);
            const cryptedPassword: Buffer = crypto.pbkdf2Sync(
              userData.userPw,
              salt.toString('base64'),
              parseInt(this.EXEC_NUM, 10),
              parseInt(this.RESULT_LENGTH, 10),
              'sha512'
            );
            const authToken = cryptedPassword.toString('hex').slice(0, 24);
            const createUser = await this.authService.createUser({
              email: userData.email,
              nickname: userData.userNick,
              screenId: generatedId,
              password: cryptedPassword.toString('base64'),
              salt: salt.toString('base64'),
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
                res.status(201).json({ result: 'ok', message: 'Mail sent' });
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
        parseInt(this.EXEC_NUM, 10),
        parseInt(this.RESULT_LENGTH, 10),
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

        res.status(200).json({
          result: 'ok',
          authToken,
          nick: targetUser.nickname,
          screenId: targetUser.screenId,
          displayLanguage: targetUser.screenId,
        });
      } else {
        next(new HttpException(400, 'Check your id and password'));
      }
    } catch (e) {
      next(new HttpException(500, `Unknown server error: ${e}`));
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction) => {};

  public snsLogin = async (req: Request, res: Response, next: NextFunction) => {};

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
      next(new HttpException(404, 'User not found'))
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
      res.status(200).json({ result: 'ok', message: 'Find account mail sent' });
    } catch (e) {
      next(e);
    }
  };

  public findPassword = async (req: Request, res: Response, next: NextFunction) => {};

  public mailAuth = async (req: Request, res: Response, next: NextFunction) => {};

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
