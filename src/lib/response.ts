import { Response } from 'express';

/**
 * @description 통합 응답 객체
 * @author taypark
 * @since 2020-02-18
 * @param res Express Response
 * @param status Http status code
 * @param data Data for requester
 * @param message Message for requester
 */
export default (
  res: Response,
  status: number = 200,
  data?: object | object[],
  message?: string
) => {
  let output: object = {
    result: 'ok',
    status,
    data,
  };

  if (status > 399) {
    output['result'] = 'error';
  }

  if (message) {
    output = { ...output, message };
  }

  return res.status(status).json(output);
};
