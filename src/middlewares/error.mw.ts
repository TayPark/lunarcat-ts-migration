import { NextFunction, Request, Response } from 'express';
import Slack from 'slack-node';

import HttpException from '../lib/httpException';
import { logger } from '../configs/winston';

const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
  const status: number = error.status || 500;
  const message: string = error.message || 'Something went wrong';

  try {
    // Only alert on 500 error
    if (process.env.NODE_ENV === 'production' && error.status === 500) {
      const slack = new Slack();
      slack.setWebhook(process.env.SLACK_WEBHOOK);
      slack.webhook(
        {
          text: `*Message*: ${error.message} \n *Stack*: ${error.stack} \n *StatusCode*: ${error.status}`,
        },
        webhookError => {
          if (webhookError) console.error(webhookError);
        }
      );
    }
    logger.error(`StatusCode : ${status}, Message : ${message}`);
    res.status(status).json({ result: 'error', status, message });
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
