import { Router } from 'express';
import AuthController from '../controllers/auth.ctrl';

const authRouter = Router({ mergeParams: true });
const authController = new AuthController();

authRouter.get('/mailAuth', authController.mailAuth);
authRouter.post('/login', authController.login);
authRouter.post('/join', authController.join);
authRouter.post('/findPass', authController.sendMailToFindPassword);
authRouter.post('/snsLogin', authController.snsLogin);
authRouter.patch('/findPass', authController.changePassword);

export default authRouter;
