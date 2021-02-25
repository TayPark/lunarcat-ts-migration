import { Router, Request, Response } from 'express';

import authRouter from './auth.route';
import usersRouter from './users.route';
// import boardRouter from './board';
// import searchRouter from './search';
// import suggestRouter from './suggest';
// import interactionRouter from './interaction';
// import notiRouter from './notification';
// import myboardRouter from './myboard';

const indexRouter = Router({ mergeParams: true });

indexRouter.get('/', (req: Request, res: Response) => {
  res.status(200).json({ result: 'ok', message: 'server is ok' });
});
indexRouter.use('/auth', authRouter);
indexRouter.use('/users', usersRouter);
// indexRouter.use('/boards', boardRouter);
// indexRouter.use('/interaction', interactionRouter);
// indexRouter.use('/search', searchRouter);
// indexRouter.use('/suggest', suggestRouter);
// indexRouter.use('/notification', notiRouter);
// indexRouter.use('/myboard', myboardRouter);

export default indexRouter;
