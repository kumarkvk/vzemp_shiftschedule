import type { RequestHandler } from 'express';
import { logger } from '../config/logger';
export const requestLogger: RequestHandler = (req, res, next) => { const startedAt = process.hrtime.bigint(); res.on('finish', () => { const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000; logger.info('HTTP request completed', { method: req.method, path: req.originalUrl, statusCode: res.statusCode, durationMs: Number(durationMs.toFixed(2)), userId: req.user?.id, ip: req.ip }); }); next(); };
