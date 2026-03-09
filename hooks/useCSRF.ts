/**
 * React Hook for CSRF Protection
 * 
 * Provides easy integration with the CSRF protection system
 * for React components and forms.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  CSRFManager, 
  CSRFToken, 
  CSRFConfig, 
  CSRFValidationResult,
  needsCSRFProtection 
} from '../lib/csrf';

export interface UseCSRFOptions {
  config?: Partial<CSRFConfig>;
  autoRefresh?: boolean;
  onError?: (error: Error) => void;
}

export interface UseCSRFReturn {
  token: CSRFToken | null;
  headers: Record<string, string>;
  isValid: boolean;
  isLoading: boolean;
  error: string | null;
  refreshToken: () => CSRFToken;
  validateToken: (token: string) => CSRFValidationResult;
  addToFormData: (formData: FormData) => FormData;
  addToSearchParams: (params: URLSearchParams) => URLSearchParams;
  status: {
    hasToken: boolean;
    isValid: boolean;
    expiresAt: number;
    timeUntilExpiration: number;
  };
}

/**
 * React hook for CSRF protection
 */
export function useCSRF(options: UseCSRFOptions = {}): UseCSRFReturn {
  const { config, autoRefresh = true, onError } = options;
  
  const [csrfManager] = useState(() => CSRFManager.getInstance(config));
  const [token, setToken] = useState<CSRFToken | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize token
  useEffect(() => {
    try {
      const currentToken = csrfManager.getCurrentToken();
      setToken(currentToken);
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize CSRF protection';
      setError(errorMessage);
      setIsLoading(false);
      
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
    }
  }, [csrfManager, onError]);

  // Auto-refresh token
  useEffect(() => {
    if (!autoRefresh || !token) return;

    // Set up refresh 5 minutes before expiration
    const refreshTime = token.expiresAt - (5 * 60 * 1000);
    const now = Date.now();
    const delay = Math.max(0, refreshTime - now);

    const timeoutId = setTimeout(() => {
      try {
        const newToken = csrfManager.refreshToken();
        setToken(newToken);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to refresh CSRF token';
        setError(errorMessage);
        
        if (onError) {
          onError(err instanceof Error ? err : new Error(errorMessage));
        }
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [autoRefresh, token, csrfManager, onError]);

  // Get current headers
  const headers = token ? csrfManager.getHeaders() : {};

  // Refresh token manually
  const refreshToken = useCallback((): CSRFToken => {
    try {
      const newToken = csrfManager.refreshToken();
      setToken(newToken);
      setError(null);
      return newToken;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh CSRF token';
      setError(errorMessage);
      
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
      
      throw err;
    }
  }, [csrfManager, onError]);

  // Validate token
  const validateToken = useCallback((tokenToValidate: string): CSRFValidationResult => {
    return csrfManager.validateToken(tokenToValidate);
  }, [csrfManager]);

  // Add token to FormData
  const addToFormData = useCallback((formData: FormData): FormData => {
    if (token) {
      formData.set(token.headerName, token.token);
    }
    return formData;
  }, [token]);

  // Add token to URLSearchParams
  const addToSearchParams = useCallback((params: URLSearchParams): URLSearchParams => {
    if (token) {
      params.set(token.headerName, token.token);
    }
    return params;
  }, [token]);

  // Get status
  const status = csrfManager.getTokenStatus();

  return {
    token,
    headers,
    isValid: status.isValid,
    isLoading,
    error,
    refreshToken,
    validateToken,
    addToFormData,
    addToSearchParams,
    status,
  };
}

/**
 * Hook for form submission with CSRF protection
 */
export function useFormCSRF(options: UseCSRFOptions = {}) {
  const { token, addToFormData, error, refreshToken } = useCSRF(options);

  const submitForm = useCallback(async <T extends unknown[], R>(
    fn: (...args: T) => Promise<R>,
    formData?: FormData,
    args: T = [] as T
  ): Promise<R> => {
    if (!token) {
      throw new Error('CSRF token not available');
    }

    // Add CSRF token to form data if provided
    if (formData) {
      addToFormData(formData);
    }

    try {
      return await fn(...args);
    } catch (err) {
      // If CSRF validation fails, try refreshing token
      if (err instanceof Error && err.message.includes('CSRF')) {
        await refreshToken();
      }
      throw err;
    }
  }, [token, addToFormData, refreshToken]);

  return {
    submitForm,
    token,
    error,
    canSubmit: !!token && !error,
  };
}

/**
 * Hook for API calls with CSRF protection
 */
export function useApiCSRF(options: UseCSRFOptions = {}) {
  const { headers, token, error, refreshToken } = useCSRF(options);

  const callApi = useCallback(async <T extends unknown[], R>(
    fn: (...args: T) => Promise<R>,
    args: T = [] as T
  ): Promise<R> => {
    if (!token) {
      throw new Error('CSRF token not available');
    }

    try {
      return await fn(...args);
    } catch (err) {
      // If CSRF validation fails, try refreshing token
      if (err instanceof Error && err.message.includes('CSRF')) {
        await refreshToken();
      }
      throw err;
    }
  }, [token, refreshToken]);

  return {
    callApi,
    headers,
    token,
    error,
    canCall: !!token && !error,
  };
}

/**
 * Higher-order component for CSRF protection
 */
export function withCSRF<P extends object>(
  Component: React.ComponentType<P>,
  options: UseCSRFOptions = {}
) {
  return function CSRFProtectedComponent(props: P) {
    const { token, error, isLoading } = useCSRF(options);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <span className="material-symbols-outlined text-primary text-2xl mb-2 animate-spin">
              refresh
            </span>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Initializing security protection...
            </p>
          </div>
        </div>
      );
    }

    if (error || !token) {
      return (
        <div className="flex items-center justify-center p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="text-center">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-2xl mb-2">
              security
            </span>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-1">
              Security Protection Failed
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300">
              {error || 'CSRF protection is not available'}
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

/**
 * Hook for fetch with CSRF protection
 */
export function useCSRFProtectedFetch() {
  const { headers, token } = useCSRF();

  const protectedFetch = useCallback(async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const requestInit = { ...init };
    
    // Add CSRF headers for state-changing requests
    if (requestInit.method && needsCSRFProtection(requestInit.method)) {
      const requestHeaders = new Headers(requestInit.headers);
      
      // Add CSRF token
      if (token) {
        requestHeaders.set(token.headerName, token.token);
      }
      
      requestInit.headers = requestHeaders;
    }

    return fetch(input, requestInit);
  }, [headers, token]);

  return {
    protectedFetch,
    headers,
    token,
  };
}

/**
 * Pre-configured hooks for common CSRF scenarios
 */
export const useAuthCSRF = () => useCSRF({
  config: {
    tokenLength: 32,
    expirationMs: 30 * 60 * 1000, // 30 minutes for auth
  }
});

export const useFormCSRF = () => useCSRF({
  config: {
    tokenLength: 32,
    expirationMs: 60 * 60 * 1000, // 1 hour for forms
  }
});

export const useApiCSRF = () => useCSRF({
  config: {
    tokenLength: 64,
    expirationMs: 15 * 60 * 1000, // 15 minutes for API calls
  }
});
