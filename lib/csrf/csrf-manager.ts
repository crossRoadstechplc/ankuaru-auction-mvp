/**
 * CSRF Protection Manager
 *
 * Implements CSRF token generation, storage, and validation
 * for protecting state-changing operations from cross-site request forgery.
 */

export interface CSRFToken {
  token: string;
  expiresAt: number;
  headerName: string;
}

export interface CSRFConfig {
  tokenLength?: number;
  expirationMs?: number;
  headerName?: string;
  cookieName?: string;
  storageKey?: string;
}

export interface CSRFValidationResult {
  isValid: boolean;
  error?: string;
  token?: string;
}

type ExpressLikeRequest = {
  method: string;
  headers: Headers | Record<string, string | string[] | undefined>;
};

type ExpressLikeResponse = {
  status: (code: number) => {
    json: (body: unknown) => unknown;
  };
};

type NextFn = () => void;

/**
 * CSRF Token Manager
 *
 * Handles CSRF token generation, storage, and validation
 * for protecting state-changing operations.
 */
export class CSRFManager {
  private static instance: CSRFManager;

  private config: Required<CSRFConfig> = {
    tokenLength: 32,
    expirationMs: 60 * 60 * 1000, // 1 hour
    headerName: "X-CSRF-Token",
    cookieName: "csrf-token",
    storageKey: "csrf-token",
  };

  private currentToken: CSRFToken | null = null;
  private tokenStore: Map<string, CSRFToken> = new Map();

  private constructor(config?: Partial<CSRFConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Initialize with existing token if available
    this.loadExistingToken();

    // Set up periodic token refresh
    this.setupTokenRefresh();
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<CSRFConfig>): CSRFManager {
    if (!CSRFManager.instance) {
      CSRFManager.instance = new CSRFManager(config);
    }
    return CSRFManager.instance;
  }

  /**
   * Generate a new CSRF token
   */
  private generateToken(): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";

    for (let i = 0; i < this.config.tokenLength; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return token;
  }

  /**
   * Create a new CSRF token
   */
  createToken(): CSRFToken {
    const token = this.generateToken();
    const expiresAt = Date.now() + this.config.expirationMs;

    const csrfToken: CSRFToken = {
      token,
      expiresAt,
      headerName: this.config.headerName,
    };

    this.currentToken = csrfToken;
    this.tokenStore.set(token, csrfToken);

    // Store in localStorage for client-side persistence
    this.storeToken(csrfToken);

    return csrfToken;
  }

  /**
   * Get the current CSRF token
   */
  getCurrentToken(): CSRFToken | null {
    // Check if current token is expired
    if (this.currentToken && this.currentToken.expiresAt <= Date.now()) {
      this.currentToken = null;
    }

    // Generate new token if none exists or expired
    if (!this.currentToken) {
      this.currentToken = this.createToken();
    }

    return this.currentToken;
  }

  /**
   * Validate a CSRF token
   */
  validateToken(token: string): CSRFValidationResult {
    if (!token || typeof token !== "string") {
      return {
        isValid: false,
        error: "Invalid CSRF token format",
      };
    }

    // Check if token exists in store
    const storedToken = this.tokenStore.get(token);

    if (!storedToken) {
      return {
        isValid: false,
        error: "CSRF token not found",
      };
    }

    // Check if token is expired
    if (storedToken.expiresAt <= Date.now()) {
      this.tokenStore.delete(token);
      return {
        isValid: false,
        error: "CSRF token expired",
      };
    }

    return {
      isValid: true,
      token: storedToken.token,
    };
  }

  /**
   * Get CSRF token for HTTP headers
   */
  getHeaders(): Record<string, string> {
    const token = this.getCurrentToken();

    if (!token) {
      return {};
    }

    return {
      [token.headerName]: token.token,
    };
  }

  /**
   * Store token in localStorage
   */
  private storeToken(token: CSRFToken): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const tokenData = {
          token: token.token,
          expiresAt: token.expiresAt,
          headerName: token.headerName,
        };

        localStorage.setItem(this.config.storageKey, JSON.stringify(tokenData));
      }
    } catch (error) {
      console.warn("Failed to store CSRF token in localStorage:", error);
    }
  }

  /**
   * Load existing token from localStorage
   */
  private loadExistingToken(): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const stored = localStorage.getItem(this.config.storageKey);

        if (stored) {
          const tokenData = JSON.parse(stored);

          // Validate stored token
          if (
            tokenData.token &&
            tokenData.expiresAt &&
            tokenData.expiresAt > Date.now()
          ) {
            this.currentToken = {
              token: tokenData.token,
              expiresAt: tokenData.expiresAt,
              headerName: tokenData.headerName || this.config.headerName,
            };

            this.tokenStore.set(tokenData.token, this.currentToken);
          } else {
            // Remove expired token
            localStorage.removeItem(this.config.storageKey);
          }
        }
      }
    } catch (error) {
      console.warn("Failed to load CSRF token from localStorage:", error);
    }
  }

  /**
   * Set up periodic token refresh
   */
  private setupTokenRefresh(): void {
    // Refresh token 5 minutes before expiration
    const refreshInterval = this.config.expirationMs - 5 * 60 * 1000;

    setInterval(() => {
      const currentToken = this.getCurrentToken();

      if (currentToken) {
        const timeUntilExpiration = currentToken.expiresAt - Date.now();

        // Refresh if token is within 5 minutes of expiration
        if (timeUntilExpiration <= 5 * 60 * 1000) {
          this.createToken();
        }
      }
    }, refreshInterval);
  }

  /**
   * Clear all stored tokens
   */
  clearTokens(): void {
    this.currentToken = null;
    this.tokenStore.clear();

    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.removeItem(this.config.storageKey);
      }
    } catch (error) {
      console.warn("Failed to clear CSRF tokens from localStorage:", error);
    }
  }

  /**
   * Get token status information
   */
  getTokenStatus(): {
    hasToken: boolean;
    isValid: boolean;
    expiresAt: number;
    timeUntilExpiration: number;
  } {
    const token = this.getCurrentToken();

    if (!token) {
      return {
        hasToken: false,
        isValid: false,
        expiresAt: 0,
        timeUntilExpiration: 0,
      };
    }

    const now = Date.now();
    const isValid = token.expiresAt > now;
    const timeUntilExpiration = isValid ? token.expiresAt - now : 0;

    return {
      hasToken: true,
      isValid,
      expiresAt: token.expiresAt,
      timeUntilExpiration,
    };
  }

  /**
   * Force token refresh
   */
  refreshToken(): CSRFToken {
    return this.createToken();
  }

  /**
   * Validate token from HTTP request
   */
  validateRequestToken(request: Request | Headers): CSRFValidationResult {
    const headers = request instanceof Request ? request.headers : request;

    // Try to get token from header
    const headerValue = headers.get(this.config.headerName);

    if (!headerValue) {
      return {
        isValid: false,
        error: "CSRF token header missing",
      };
    }

    return this.validateToken(headerValue);
  }

  /**
   * Add CSRF token to request headers
   */
  addTokenToRequest(request: Request | Headers): void {
    const headers = request instanceof Request ? request.headers : request;
    const token = this.getCurrentToken();

    if (token) {
      headers.set(token.headerName, token.token);
    }
  }

  /**
   * Create a fetch wrapper with CSRF protection
   */
  createProtectedFetch(originalFetch: typeof fetch): typeof fetch {
    return async (input, init) => {
      // Add CSRF token to headers for state-changing requests
      if (
        init &&
        ["POST", "PUT", "DELETE", "PATCH"].includes(init.method || "GET")
      ) {
        const headers = new Headers(init.headers);
        this.addTokenToRequest(headers);

        // Update init with new headers
        init.headers = headers;
      }

      return originalFetch(input, init);
    };
  }

  /**
   * Middleware for Express.js (if needed)
   */
  expressMiddleware() {
    return (req: ExpressLikeRequest, res: ExpressLikeResponse, next: NextFn) => {
      // For GET requests, no CSRF protection needed
      if (req.method === "GET") {
        return next();
      }

      // Validate CSRF token
      const headers =
        req.headers instanceof Headers
          ? req.headers
          : new Headers(req.headers as Record<string, string>);
      const result = this.validateRequestToken(headers);

      if (!result.isValid) {
        return res.status(403).json({
          error: "CSRF token validation failed",
          message: result.error,
        });
      }

      next();
    };
  }
}

/**
 * Default CSRF manager instance
 */
export const csrfManager = CSRFManager.getInstance();

/**
 * Initialize CSRF protection
 */
export function initializeCSRF(config?: Partial<CSRFConfig>): CSRFManager {
  return CSRFManager.getInstance(config);
}

/**
 * Utility function to check if request needs CSRF protection
 */
export function needsCSRFProtection(method: string): boolean {
  const protectedMethods = ["POST", "PUT", "DELETE", "PATCH"];
  return protectedMethods.includes(method.toUpperCase());
}

/**
 * Utility function to add CSRF token to form data
 */
export function addCSRFToFormData(
  formData: FormData,
  token?: string,
): FormData {
  const csrfToken = token || csrfManager.getCurrentToken()?.token;

  if (csrfToken) {
    formData.append("csrf_token", csrfToken);
  }

  return formData;
}

/**
 * Utility function to add CSRF token to URLSearchParams
 */
export function addCSRFToSearchParams(
  params: URLSearchParams,
  token?: string,
): URLSearchParams {
  const csrfToken = token || csrfManager.getCurrentToken()?.token;

  if (csrfToken) {
    params.append("csrf_token", csrfToken);
  }

  return params;
}
