import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { RequestHandler, Response, Request, NextFunction } from 'express';

import { NotFoundException } from '../lib/exceptions';

function inputValidator<T>(type: any): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    validate(plainToClass(type, req.body)).then((errors: ValidationError[]) => {
      if (errors.length > 0) {
        const message = errors
          .map((error: ValidationError) => Object.values(error.constraints))
          .join(', ');
        next(new NotFoundException(message));
      } else {
        next();
      }
    });
  };
}

export default inputValidator;
