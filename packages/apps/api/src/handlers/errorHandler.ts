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
  res.status(status).json(err.message ? toMessage(err.message) : undefined);

  // These are unexpected errors
  if (!(err instanceof HttpError)) {
    console.error(err);
  }
};
