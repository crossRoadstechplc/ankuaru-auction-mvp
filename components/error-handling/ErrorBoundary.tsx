/**
 * React Error Boundary Component
 * Catches and handles errors in React component trees
 */

"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { ErrorHandler } from "../../lib/error-handler/error-handler";
import {
    CentralizedError,
    ErrorCategory,
    ErrorContext,
} from "../../lib/error-handler/error-types";

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<{
    error: CentralizedError;
    resetError: () => void;
  }>;
  onError?: (error: CentralizedError, errorInfo: ErrorInfo) => void;
  isolate?: boolean; // If true, errors don't bubble up to parent boundaries
}

interface State {
  hasError: boolean;
  error: CentralizedError | null;
  errorInfo: ErrorInfo | null;
}

const DefaultErrorFallback: React.FC<{
  error: CentralizedError;
  resetError: () => void;
}> = ({ error, resetError }) => {
  const getErrorMessage = () => {
    switch (error.category) {
      case ErrorCategory.NETWORK_ERROR:
        return {
          title: "Connection Error",
          message: error.userMessage,
          action: "Check your internet connection and try again.",
          icon: "wifi_off",
          color: "text-orange-600",
        };
      case ErrorCategory.AUTHENTICATION_ERROR:
        return {
          title: "Authentication Required",
          message: error.userMessage,
          action: "Please log in to continue.",
          icon: "lock",
          color: "text-red-600",
        };
      case ErrorCategory.AUTHORIZATION_ERROR:
        return {
          title: "Access Denied",
          message: error.userMessage,
          action: "You do not have permission to view this content.",
          icon: "block",
          color: "text-red-600",
        };
      case ErrorCategory.SERVER_ERROR:
        return {
          title: "Server Error",
          message: error.userMessage,
          action: "Please try again in a few moments.",
          icon: "error",
          color: "text-red-600",
        };
      default:
        return {
          title: "Something went wrong",
          message: error.userMessage,
          action: "Please try refreshing the page.",
          icon: "error_outline",
          color: "text-slate-600",
        };
    }
  };

  const errorInfo = getErrorMessage();

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <span
            className={`material-symbols-outlined text-6xl ${errorInfo.color}`}
          >
            {errorInfo.icon}
          </span>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {errorInfo.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-2">
            {errorInfo.message}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            {errorInfo.action}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={resetError}
            className="w-full px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>

          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
          >
            Refresh Page
          </button>
        </div>

        {/* Show error details in development */}
        {process.env.NODE_ENV === "development" && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-400">
              Error Details (Development)
            </summary>
            <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono text-slate-700 dark:text-slate-300 overflow-auto">
              <div className="mb-2">
                <strong>Category:</strong> {error.category}
              </div>
              <div className="mb-2">
                <strong>Severity:</strong> {error.severity}
              </div>
              <div className="mb-2">
                <strong>Message:</strong> {error.message}
              </div>
              {error.statusCode && (
                <div className="mb-2">
                  <strong>Status Code:</strong> {error.statusCode}
                </div>
              )}
              {error.context && (
                <div className="mb-2">
                  <strong>Context:</strong>
                  <pre className="mt-1 whitespace-pre-wrap">
                    {JSON.stringify(error.context, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

export class ErrorBoundary extends Component<Props, State> {
  private errorHandler = ErrorHandler.getInstance();

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Handle the error through our centralized error handler
    const centralizedError = this.errorHandler.handleError(error, {
      component: "ErrorBoundary",
      errorBoundary: true,
      componentStack: errorInfo.componentStack,
    });

    this.setState({
      error: centralizedError,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(centralizedError, errorInfo);
    }

    // Log the error boundary catch
    console.error("[ErrorBoundary] Caught error:", {
      error: centralizedError,
      errorInfo,
      isolate: this.props.isolate,
    });
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

// HOC to wrap components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{
    error: CentralizedError;
    resetError: () => void;
  }>,
  onError?: (error: CentralizedError, errorInfo: ErrorInfo) => void,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Hook for handling errors in functional components
export function useErrorHandler() {
  const errorHandler = ErrorHandler.getInstance();
  const handleError = (error: unknown, context?: ErrorContext): CentralizedError => {
    return errorHandler.handleError(error, context);
  };

  const executeWithErrorHandling = async function <T>(
    fn: () => Promise<T>,
    context?: ErrorContext,
  ): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      handleError(error, context);
      return null;
    }
  };

  return {
    handleError,
    executeWithErrorHandling,
    errorHandler,
  };
}
