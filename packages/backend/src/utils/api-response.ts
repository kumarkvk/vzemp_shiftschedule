import type { Response } from 'express';
import type { PaginationMeta } from '../types/api';

export const sendSuccess = <T>(res: Response, options: { statusCode?: number; message?: string; data: T; pagination?: PaginationMeta }): void => {
  res.status(options.statusCode ?? 200).json({ success: true, message: options.message, data: options.data, pagination: options.pagination });
};
export const sendNoContent = (res: Response): void => { res.status(204).send(); };
