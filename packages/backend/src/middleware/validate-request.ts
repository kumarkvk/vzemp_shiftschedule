import type { RequestHandler } from 'express';
import type { ValidationChain } from 'express-validator';
import { validationResult } from 'express-validator';
import { ValidationAppError } from '../errors/AppError';
export const validateRequest = (validations: ValidationChain[]): RequestHandler[] => [...validations, (req, _res, next) => { const errors = validationResult(req); if (!errors.isEmpty()) { next(new ValidationAppError('Request validation failed', errors.array())); return; } next(); }];
