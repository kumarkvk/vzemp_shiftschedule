import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';
import type { RequestUser } from '../types/api';

export interface JwtPayload extends RequestUser { sub: string; }
const buildPayload = (user: RequestUser): JwtPayload => ({ sub: user.id, id: user.id, email: user.email, role: user.role });
const signToken = (secret: string, expiresIn: string, user: RequestUser): string => jwt.sign(buildPayload(user), secret, { expiresIn } as SignOptions);
export const signAccessToken = (user: RequestUser): string => signToken(config.auth.jwtSecret, config.auth.jwtExpiry, user);
export const signRefreshToken = (user: RequestUser): string => signToken(config.auth.jwtRefreshSecret, config.auth.jwtRefreshExpiry, user);
const normalizeTokenPayload = (decoded: string | jwt.JwtPayload): RequestUser => { if (typeof decoded === 'string') { throw new Error('Invalid token payload'); } return { id: String(decoded.sub ?? decoded.id), email: String(decoded.email), role: decoded.role as RequestUser['role'] }; };
export const verifyAccessToken = (token: string): RequestUser => normalizeTokenPayload(jwt.verify(token, config.auth.jwtSecret));
export const verifyRefreshToken = (token: string): RequestUser => normalizeTokenPayload(jwt.verify(token, config.auth.jwtRefreshSecret));
