import type { RequestHandler } from 'express';
import { AuthenticationError, ForbiddenError } from '../errors/AppError';
import { verifyAccessToken } from '../utils/jwt';

export const authenticate: RequestHandler = (req, _res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader?.startsWith('Bearer ')) {
    next(new AuthenticationError('Authorization header is required'));
    return;
  }

  try {
    req.user = verifyAccessToken(authorizationHeader.slice('Bearer '.length).trim());
    next();
  } catch {
    next(new AuthenticationError('Invalid or expired access token'));
  }
};

export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (!req.user) {
    next(new AuthenticationError('Authentication required'));
    return;
  }

  if (req.user.role !== 'admin') {
    next(new ForbiddenError('Administrator access required'));
    return;
  }

  next();
};
