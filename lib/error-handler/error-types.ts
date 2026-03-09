/**
 * Centralized Error Types and Classification System
 */

export enum ErrorCategory {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR', 
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  BUSINESS_LOGIC_ERROR = 'BUSINESS_LOGIC_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM', 
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface AppError {
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  code?: string;
  statusCode?: number;
  originalError?: Error | unknown;
  timestamp: Date;
  context?: Record<string, unknown>;
  retryable: boolean;
  recoverable: boolean;
}

export interface NetworkErrorInfo {
  url: string;
  method: string;
  timeout?: boolean;
  offline?: boolean;
  statusCode?: number;
}

export interface GraphQLErrorInfo {
  query?: string;
  variables?: Record<string, unknown>;
  extensions?: Record<string, unknown>;
  path?: Array<string | number>;
}

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  [key: string]: unknown;
}

export class CentralizedError extends Error {
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly userMessage: string;
  public readonly code?: string;
  public readonly statusCode?: number;
  public readonly originalError?: Error | unknown;
  public readonly timestamp: Date;
  public readonly context?: ErrorContext;
  public readonly retryable: boolean;
  public readonly recoverable: boolean;

  constructor(options: {
    category: ErrorCategory;
    severity: ErrorSeverity;
    message: string;
    userMessage: string;
    code?: string;
    statusCode?: number;
    originalError?: Error | unknown;
    context?: ErrorContext;
    retryable?: boolean;
    recoverable?: boolean;
  }) {
    super(options.message);
    this.name = 'CentralizedError';
    this.category = options.category;
    this.severity = options.severity;
    this.userMessage = options.userMessage;
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.originalError = options.originalError;
    this.timestamp = new Date();
    this.context = options.context;
    this.retryable = options.retryable ?? false;
    this.recoverable = options.recoverable ?? true;

    // Maintain stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CentralizedError);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      category: this.category,
      severity: this.severity,
      message: this.message,
      userMessage: this.userMessage,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      context: this.context,
      retryable: this.retryable,
      recoverable: this.recoverable,
      // Don't include originalError in JSON to avoid circular references
    };
  }
}

// Error factory functions for common error types
export const createNetworkError = (
  message: string,
  userMessage: string,
  context?: ErrorContext,
  statusCode?: number
): CentralizedError => {
  return new CentralizedError({
    category: ErrorCategory.NETWORK_ERROR,
    severity: statusCode && statusCode >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
    message,
    userMessage,
    statusCode,
    context,
    retryable: true,
    recoverable: true,
  });
};

export const createAuthenticationError = (
  message: string,
  userMessage: string = 'Please log in to continue',
  context?: ErrorContext
): CentralizedError => {
  return new CentralizedError({
    category: ErrorCategory.AUTHENTICATION_ERROR,
    severity: ErrorSeverity.HIGH,
    message,
    userMessage,
    statusCode: 401,
    context,
    retryable: false,
    recoverable: true,
  });
};

export const createAuthorizationError = (
  message: string,
  userMessage: string = 'You do not have permission to perform this action',
  context?: ErrorContext
): CentralizedError => {
  return new CentralizedError({
    category: ErrorCategory.AUTHORIZATION_ERROR,
    severity: ErrorSeverity.HIGH,
    message,
    userMessage,
    statusCode: 403,
    context,
    retryable: false,
    recoverable: false,
  });
};

export const createValidationError = (
  message: string,
  userMessage: string = 'Please check your input and try again',
  context?: ErrorContext
): CentralizedError => {
  return new CentralizedError({
    category: ErrorCategory.VALIDATION_ERROR,
    severity: ErrorSeverity.MEDIUM,
    message,
    userMessage,
    statusCode: 400,
    context,
    retryable: false,
    recoverable: true,
  });
};

export const createBusinessLogicError = (
  message: string,
  userMessage: string,
  context?: ErrorContext,
  statusCode: number = 400
): CentralizedError => {
  return new CentralizedError({
    category: ErrorCategory.BUSINESS_LOGIC_ERROR,
    severity: ErrorSeverity.LOW,
    message,
    userMessage,
    statusCode,
    context,
    retryable: false,
    recoverable: true,
  });
};

export const createServerError = (
  message: string,
  userMessage: string = 'Something went wrong on our end. Please try again later',
  context?: ErrorContext,
  statusCode: number = 500
): CentralizedError => {
  return new CentralizedError({
    category: ErrorCategory.SERVER_ERROR,
    severity: ErrorSeverity.CRITICAL,
    message,
    userMessage,
    statusCode,
    context,
    retryable: true,
    recoverable: true,
  });
};

export const createUnknownError = (
  error: Error | unknown,
  context?: ErrorContext
): CentralizedError => {
  const message = error instanceof Error ? error.message : 'Unknown error occurred';
  return new CentralizedError({
    category: ErrorCategory.UNKNOWN_ERROR,
    severity: ErrorSeverity.MEDIUM,
    message,
    userMessage: 'An unexpected error occurred. Please try again',
    originalError: error,
    context,
    retryable: false,
    recoverable: true,
  });
};
