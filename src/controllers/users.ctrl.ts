import { Request, Response, NextFunction } from 'express';
import MongoAuthRepository from '../repositories/mongo.auth.repo';
import UsersService from '../services/users.service';

class UsersController {
  private usersService: UsersService = new UsersService(new MongoAuthRepository());

  public getUserProfile = async (req: Request, res: Response, next: NextFunction) => {};

  public postUserProfile = async (req: Request, res: Response, next: NextFunction) => {};
}

export default UsersController;
