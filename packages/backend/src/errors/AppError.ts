export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  public constructor(message: string, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
  }
}

export class ValidationAppError extends AppError { public constructor(message: string, details?: unknown) { super(message, 400, 'VALIDATION_ERROR', details); } }
export class AuthenticationError extends AppError { public constructor(message = 'Authentication required') { super(message, 401, 'UNAUTHORIZED'); } }
export class ForbiddenError extends AppError { public constructor(message = 'You do not have access to this resource') { super(message, 403, 'FORBIDDEN'); } }
export class NotFoundError extends AppError { public constructor(message = 'Resource not found') { super(message, 404, 'NOT_FOUND'); } }
export class ConflictError extends AppError { public constructor(message: string) { super(message, 409, 'CONFLICT'); } }
export class DatabaseError extends AppError { public constructor(message = 'Database operation failed', details?: unknown) { super(message, 500, 'DATABASE_ERROR', details); } }
export class ExternalServiceError extends AppError { public constructor(message: string, details?: unknown) { super(message, 502, 'EXTERNAL_SERVICE_ERROR', details); } }
