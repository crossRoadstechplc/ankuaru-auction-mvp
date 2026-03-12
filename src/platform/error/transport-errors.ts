export type TransportErrorCategory =
  | "NETWORK_ERROR"
  | "AUTHENTICATION_ERROR"
  | "AUTHORIZATION_ERROR"
  | "VALIDATION_ERROR"
  | "BUSINESS_LOGIC_ERROR"
  | "SERVER_ERROR"
  | "UNKNOWN_ERROR";

type TransportErrorOptions = {
  message: string;
  category: TransportErrorCategory;
  statusCode?: number;
  code?: string;
  retryable?: boolean;
  details?: Record<string, unknown>;
};

export class TransportError extends Error {
  public readonly category: TransportErrorCategory;
  public readonly statusCode?: number;
  public readonly code?: string;
  public readonly retryable: boolean;
  public readonly details?: Record<string, unknown>;

  constructor(options: TransportErrorOptions) {
    super(options.message);
    this.name = "TransportError";
    this.category = options.category;
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.retryable = options.retryable ?? false;
    this.details = options.details;
  }

  static network(
    message: string,
    details?: Record<string, unknown>,
  ): TransportError {
    return new TransportError({
      message,
      category: "NETWORK_ERROR",
      retryable: true,
      details,
    });
  }

  static authentication(
    message: string,
    statusCode?: number,
    details?: Record<string, unknown>,
  ): TransportError {
    return new TransportError({
      message,
      category: "AUTHENTICATION_ERROR",
      statusCode,
      retryable: false,
      details,
    });
  }

  static authorization(
    message: string,
    statusCode?: number,
    details?: Record<string, unknown>,
  ): TransportError {
    return new TransportError({
      message,
      category: "AUTHORIZATION_ERROR",
      statusCode,
      retryable: false,
      details,
    });
  }

  static validation(
    message: string,
    statusCode?: number,
    details?: Record<string, unknown>,
  ): TransportError {
    return new TransportError({
      message,
      category: "VALIDATION_ERROR",
      statusCode,
      retryable: false,
      details,
    });
  }

  static business(
    message: string,
    statusCode?: number,
    details?: Record<string, unknown>,
  ): TransportError {
    return new TransportError({
      message,
      category: "BUSINESS_LOGIC_ERROR",
      statusCode,
      retryable: false,
      details,
    });
  }

  static server(
    message: string,
    statusCode?: number,
    details?: Record<string, unknown>,
  ): TransportError {
    return new TransportError({
      message,
      category: "SERVER_ERROR",
      statusCode,
      retryable: true,
      details,
    });
  }

  static unknown(
    message: string,
    details?: Record<string, unknown>,
  ): TransportError {
    return new TransportError({
      message,
      category: "UNKNOWN_ERROR",
      retryable: false,
      details,
    });
  }
}

