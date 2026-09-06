import { Request, Response, NextFunction } from 'express';
import { AppError, sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // If response has already been initiated, delegate to Express default handler
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof AppError) {
    logger.warn(`AppError: ${err.code} - ${err.message}`, {
      path: req.path,
      method: req.method,
      details: err.details
    });
    return sendError(res, err.statusCode, err.code, err.message, err.details);
  }

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(
        res,
        400,
        'FILE_TOO_LARGE',
        'Please upload a JPG, PNG, or WEBP image under 10 MB.'
      );
    }
    return sendError(res, 400, 'UPLOAD_ERROR', err.message);
  }

  // Handle Syntax / JSON parse error
  if (err instanceof SyntaxError && 'body' in err) {
    return sendError(res, 400, 'INVALID_JSON', 'Malformed JSON payload.');
  }

  // Log unhandled server error
  logger.error('Unhandled Internal Server Error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  return sendError(
    res,
    500,
    'INTERNAL_SERVER_ERROR',
    'Something went wrong while connecting to SnapCut AI. Please check your connection and try again.'
  );
}
