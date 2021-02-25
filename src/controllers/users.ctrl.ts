import { Request, Response, NextFunction } from 'express';
import MongoAuthRepository from '../repositories/mongo.auth.repo';
import UsersService from '../services/users.service';
import IntResponse from '../lib/response';
import { UserEntity } from '../domains/users.entity';
import { UserTokenDto } from '../dtos/users.dto';

class UsersController {
  private usersService: UsersService = new UsersService(new MongoAuthRepository());

  public getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    const userId: string = (res.locals.user as UserTokenDto)._id;

    const userProfile: UserEntity = await this.usersService.getUserProfile(userId)

    IntResponse(res, 200, userProfile)
  };

  public postUserProfile = async (req: Request, res: Response, next: NextFunction) => {};
}

export default UsersController;
