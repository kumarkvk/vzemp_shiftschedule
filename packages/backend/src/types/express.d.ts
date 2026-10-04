import type { RequestUser } from './api';

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
      rawBody?: Buffer;
    }
  }
}

export {};
