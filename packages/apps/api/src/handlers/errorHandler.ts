import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../models/HttpError';
import { toMessage } from '../models/common';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(err);
  }

  const status = err instanceof HttpError ? err.status : 500;
  const message = err.message ?? 'Something went wrong';

  res.status(status).json(toMessage(message));
};
