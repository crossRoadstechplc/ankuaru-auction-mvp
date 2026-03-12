/**
 * Centralized Error Handler
 * Provides unified error processing, classification, and recovery mechanisms
 */

import {
  CentralizedError,
  ErrorCategory,
  ErrorContext,
  ErrorSeverity,
  createAuthenticationError,
  createAuthorizationError,
  createBusinessLogicError,
  createNetworkError,
  createServerError,
  createUnknownError,
  createValidationError,
} from "./error-types";

export interface ErrorHandlerConfig {
  enableDebugLogging: boolean;
  enableUserNotifications: boolean;
  maxRetryAttempts: number;
  retryDelay: number;
  enableErrorReporting: boolean;
}

export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: CentralizedError) => boolean;
}

type GraphQLErrorLike = {
  errors?: Array<{
    message?: string;
    extensions?: {
      code?: string;
    };
  }>;
  status?: number;
};

export class ErrorHandler {
  private static instance: ErrorHandler;
  private config: ErrorHandlerConfig;
  private errorHistory: CentralizedError[] = [];
  private retryAttempts = new Map<string, number>();

  private constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = {
      enableDebugLogging: process.env.NODE_ENV !== "production",
      enableUserNotifications: true,
      maxRetryAttempts: 3,
      retryDelay: 1000,
      enableErrorReporting: process.env.NODE_ENV === "production",
      ...config,
    };
  }

  public static getInstance(
    config?: Partial<ErrorHandlerConfig>,
  ): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler(config);
    }
    return ErrorHandler.instance;
  }

  /**
   * Process and classify an error
   */
  public handleError(
    error: Error | unknown,
    context?: ErrorContext,
  ): CentralizedError {
    const centralizedError = this.classifyError(error, context);

    // Store error in history
    this.errorHistory.push(centralizedError);

    // Log error
    this.logError(centralizedError);

    // Report error if enabled
    if (this.config.enableErrorReporting) {
      this.reportError(centralizedError);
    }

    return centralizedError;
  }

  /**
   * Classify different types of errors into centralized format
   */
  private classifyError(
    error: Error | unknown,
    context?: ErrorContext,
  ): CentralizedError {
    // Network errors
    if (this.isNetworkError(error)) {
      return this.handleNetworkError(error as Error, context);
    }

    // GraphQL errors
    if (this.isGraphQLError(error)) {
      return this.handleGraphQLError(error, context);
    }

    // HTTP status errors
    if (this.isHttpError(error)) {
      return this.handleHttpError(error, context);
    }

    // Known error types
    if (error instanceof CentralizedError) {
      return error;
    }

    // Unknown errors
    return createUnknownError(error, context);
  }

  /**
   * Handle network-related errors
   */
  private handleNetworkError(
    error: unknown,
    context?: ErrorContext,
  ): CentralizedError {
    const errorObj =
      error instanceof Error
        ? error
        : new Error(String(error || "Network error"));
    const message = errorObj.message;

    if (
      message.includes("failed to fetch") ||
      message.includes("networkerror")
    ) {
      return createNetworkError(
        "Network connection failed",
        "Unable to connect to the server. Please check your internet connection and try again.",
        context,
        0,
      );
    }

    if (message.includes("timeout")) {
      return createNetworkError(
        "Request timeout",
        "The request took too long. Please try again.",
        context,
        408,
      );
    }

    return createNetworkError(
      errorObj.message,
      "A network error occurred. Please try again.",
      context,
    );
  }

  /**
   * Handle GraphQL errors
   */
  private handleGraphQLError(
    error: unknown,
    context?: ErrorContext,
  ): CentralizedError {
    const gqlError = error as GraphQLErrorLike;

    if (!gqlError.errors || !Array.isArray(gqlError.errors) || gqlError.errors.length === 0) {
      return createUnknownError(error, context);
    }

    const primaryError = gqlError.errors[0] || {};
    const message = primaryError.message || "GraphQL error occurred";
    const extensions = primaryError.extensions || {};
    const code = extensions.code;
    const statusCode = gqlError.status;

    // Authentication errors
    if (statusCode === 401 || code === "UNAUTHENTICATED") {
      return createAuthenticationError(
        message,
        "Please log in to continue",
        context,
      );
    }

    // Authorization errors
    if (
      statusCode === 403 ||
      code === "FORBIDDEN" ||
      code === "PERMISSION_DENIED"
    ) {
      return createAuthorizationError(
        message,
        "You do not have permission to perform this action",
        context,
      );
    }

    // Validation errors
    if (
      statusCode === 400 ||
      code === "BAD_USER_INPUT" ||
      code === "GRAPHQL_VALIDATION_FAILED"
    ) {
      return createValidationError(
        message,
        "Please check your input and try again",
        context,
      );
    }

    // Business logic errors (expected 404s, etc.)
    if (statusCode === 404 || code === "NOT_FOUND") {
      if (message.includes("No bid found") || message.includes("not found")) {
        return createBusinessLogicError(message, "No data found", context, 404);
      }
    }

    // Specific business logic error detection (KISS principle)
    const lowerMessage = message.toLowerCase();
    if (
      lowerMessage.includes("email") &&
      lowerMessage.includes("username") &&
      lowerMessage.includes("exists")
    ) {
      return createBusinessLogicError(
        message,
        "It looks like either that email or username is already in use. Please check your details or try a different one.",
        context,
        409,
      );
    }

    if (
      lowerMessage.includes("username") &&
      (lowerMessage.includes("taken") || lowerMessage.includes("exists"))
    ) {
      return createBusinessLogicError(
        message,
        "This username is already taken. Please choose another one.",
        context,
        400,
      );
    }

    if (
      lowerMessage.includes("email") &&
      (lowerMessage.includes("taken") || lowerMessage.includes("exists"))
    ) {
      return createBusinessLogicError(
        message,
        "This email is already registered. Please use another one or log in.",
        context,
        400,
      );
    }

    if (
      lowerMessage.includes("invalid") &&
      (lowerMessage.includes("credential") || lowerMessage.includes("password"))
    ) {
      return createBusinessLogicError(
        message,
        "Invalid email or password. Please check your credentials.",
        context,
        401,
      );
    }

    // Server errors
    if (typeof statusCode === "number" && statusCode >= 500) {
      return createServerError(
        message,
        "Server error occurred. Please try again later",
        context,
        statusCode,
      );
    }

    // Default GraphQL error
    return createUnknownError(error, {
      ...context,
      extensions,
      statusCode,
      code,
    });
  }

  /**
   * Handle HTTP status errors
   */
  private handleHttpError(
    error: unknown,
    context?: ErrorContext,
  ): CentralizedError {
    const errorObj =
      error instanceof Error
        ? error
        : new Error(String(error || "Unknown error"));
    const message = errorObj.message;

    if (message.includes("401")) {
      return createAuthenticationError(
        message,
        "Please log in to continue",
        context,
      );
    }

    if (message.includes("403")) {
      return createAuthorizationError(
        message,
        "You do not have permission to perform this action",
        context,
      );
    }

    if (message.includes("400")) {
      return createValidationError(
        message,
        "Please check your input and try again",
        context,
      );
    }

    if (message.includes("404")) {
      return createBusinessLogicError(
        message,
        "Resource not found",
        context,
        404,
      );
    }

    if (message.includes("500")) {
      return createServerError(
        message,
        "Server error occurred. Please try again later",
        context,
        500,
      );
    }

    return createUnknownError(error, context);
  }

  /**
   * Execute a function with retry logic
   */
  public async executeWithRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {},
    context?: ErrorContext,
  ): Promise<T> {
    const {
      maxAttempts = this.config.maxRetryAttempts,
      delay = this.config.retryDelay,
      backoffMultiplier = 2,
      shouldRetry = (error) => error.retryable,
    } = options;

    let lastError: CentralizedError;
    const operationId = Math.random().toString(36).substring(7);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await fn();
        // Clear retry attempts on success
        this.retryAttempts.delete(operationId);
        return result;
      } catch (error) {
        lastError = this.handleError(error, {
          ...context,
          attempt,
          maxAttempts,
        });

        if (attempt === maxAttempts || !shouldRetry(lastError)) {
          break;
        }

        // Calculate delay with exponential backoff
        const currentDelay = delay * Math.pow(backoffMultiplier, attempt - 1);

        if (this.config.enableDebugLogging) {
          console.log(
            `[ErrorHandler] Retrying operation ${operationId} in ${currentDelay}ms (attempt ${attempt}/${maxAttempts})`,
          );
        }

        await new Promise((resolve) => setTimeout(resolve, currentDelay));
      }
    }

    throw lastError!;
  }

  /**
   * Check if error is a network error
   */
  private isNetworkError(error: Error | unknown): boolean {
    if (!(error instanceof Error)) return false;

    const message = error.message.toLowerCase();
    return (
      message.includes("failed to fetch") ||
      message.includes("networkerror") ||
      message.includes("timeout") ||
      message.includes("connection refused") ||
      message.includes("network connection")
    );
  }

  /**
   * Check if error is a GraphQL error
   */
  private isGraphQLError(error: Error | unknown): boolean {
    const gqlError = error as GraphQLErrorLike;
    return Array.isArray(gqlError.errors);
  }

  /**
   * Check if error is an HTTP status error
   */
  private isHttpError(error: Error | unknown): boolean {
    if (!(error instanceof Error)) return false;

    const message = error.message;
    return /\b(401|403|404|500|502|503)\b/.test(message);
  }

  /**
   * Log error with appropriate level
   */
  private logError(error: CentralizedError): void {
    if (!this.config.enableDebugLogging) return;

    const logData = {
      category: error.category,
      severity: error.severity,
      message: error.message,
      userMessage: error.userMessage,
      code: error.code,
      statusCode: error.statusCode,
      context: error.context,
      timestamp: error.timestamp,
    };

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        console.error("[ErrorHandler] CRITICAL:", logData);
        break;
      case ErrorSeverity.HIGH:
        console.error("[ErrorHandler] HIGH:", logData);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn("[ErrorHandler] MEDIUM:", logData);
        break;
      case ErrorSeverity.LOW:
        console.info("[ErrorHandler] LOW:", logData);
        break;
    }
  }

  /**
   * Report error to monitoring service
   */
  private reportError(error: CentralizedError): void {
    // In production, this would send to error monitoring service
    // For now, just log that reporting would happen
    if (this.config.enableDebugLogging) {
      console.log(
        "[ErrorHandler] Error reported to monitoring service:",
        error.toJSON(),
      );
    }
  }

  /**
   * Get error statistics
   */
  public getErrorStats(): {
    total: number;
    byCategory: Record<ErrorCategory, number>;
    bySeverity: Record<ErrorSeverity, number>;
    recent: CentralizedError[];
  } {
    const byCategory = Object.values(ErrorCategory).reduce(
      (acc, category) => {
        acc[category] = 0;
        return acc;
      },
      {} as Record<ErrorCategory, number>,
    );

    const bySeverity = Object.values(ErrorSeverity).reduce(
      (acc, severity) => {
        acc[severity] = 0;
        return acc;
      },
      {} as Record<ErrorSeverity, number>,
    );

    this.errorHistory.forEach((error) => {
      byCategory[error.category]++;
      bySeverity[error.severity]++;
    });

    return {
      total: this.errorHistory.length,
      byCategory,
      bySeverity,
      recent: this.errorHistory.slice(-10), // Last 10 errors
    };
  }

  /**
   * Clear error history
   */
  public clearErrorHistory(): void {
    this.errorHistory = [];
    this.retryAttempts.clear();
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
