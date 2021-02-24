import { Router } from 'express';
import UserController from '../controllers/users.ctrl';
import { verifyToken } from '../middlewares/token-auth.mw';

const usersRouter = Router({ mergeParams: true });
const userController = new UserController();

usersRouter.get('/editProfile', verifyToken, userController.getUserProfile);
usersRouter.post('/editProfile', verifyToken, userController.postUserProfile);

export default usersRouter;
