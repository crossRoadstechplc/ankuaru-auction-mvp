/**
 * Toast Notification Manager
 * Centralized toast notification handling for errors and user feedback
 */

import { CentralizedError, ErrorCategory, ErrorSeverity } from "./error-types";

export interface ToastConfig {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

export class ToastManager {
  private static instance: ToastManager;
  private toasts: Map<string, ToastConfig> = new Map();
  private listeners: Set<(toasts: ToastConfig[]) => void> = new Set();
  private toastIdCounter = 0;

  private constructor() {}

  public static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  /**
   * Subscribe to toast updates
   */
  public subscribe(listener: (toasts: ToastConfig[]) => void): () => void {
    this.listeners.add(listener);

    // Immediately send current state
    listener(this.getAllToasts());

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get all current toasts
   */
  public getAllToasts(): ToastConfig[] {
    return Array.from(this.toasts.values());
  }

  /**
   * Show a toast notification
   */
  public showToast(config: Omit<ToastConfig, "id">): string {
    const id = this.generateToastId();
    const toast: ToastConfig = {
      id,
      duration: this.getDefaultDuration(config.type),
      persistent: false,
      ...config,
    };

    this.toasts.set(id, toast);
    this.notifyListeners();

    // Auto-remove if not persistent
    if (!toast.persistent && toast.duration && toast.duration > 0) {
      setTimeout(() => {
        this.removeToast(id);
      }, toast.duration);
    }

    return id;
  }

  /**
   * Show error toast from centralized error
   */
  public showError(
    error: CentralizedError,
    options: {
      title?: string;
      message?: string;
      showRetry?: boolean;
      onRetry?: () => void;
    } = {},
  ): string {
    const id = this.generateToastId();
    const toast: ToastConfig = {
      id,
      type: this.getToastTypeFromError(error),
      title: options.title || this.getDefaultTitle(error),
      message: options.message || error.userMessage,
      duration: this.getDefaultDuration(this.getToastTypeFromError(error)),
      action:
        options.showRetry && options.onRetry
          ? {
              label: "Retry",
              onClick: options.onRetry,
            }
          : undefined,
    };

    this.toasts.set(id, toast);
    this.notifyListeners();

    // Auto-remove if not persistent
    if (!toast.persistent && toast.duration && toast.duration > 0) {
      setTimeout(() => {
        this.removeToast(id);
      }, toast.duration);
    }

    return id;
  }

  /**
   * Show success toast
   */
  public showSuccess(title: string, message?: string): string {
    return this.showToast({
      type: "success",
      title,
      message: message || "",
    });
  }

  /**
   * Show warning toast
   */
  public showWarning(title: string, message?: string): string {
    return this.showToast({
      type: "warning",
      title,
      message: message || "",
    });
  }

  /**
   * Show info toast
   */
  public showInfo(title: string, message?: string): string {
    return this.showToast({
      type: "info",
      title,
      message: message || "",
    });
  }

  /**
   * Remove a specific toast
   */
  public removeToast(id: string): void {
    const toast = this.toasts.get(id);
    if (toast) {
      toast.onClose?.();
      this.toasts.delete(id);
      this.notifyListeners();
    }
  }

  /**
   * Clear all toasts
   */
  public clearAllToasts(): void {
    this.toasts.forEach((toast) => toast.onClose?.());
    this.toasts.clear();
    this.notifyListeners();
  }

  /**
   * Update a toast
   */
  public updateToast(id: string, updates: Partial<ToastConfig>): void {
    const toast = this.toasts.get(id);
    if (toast) {
      const updatedToast = { ...toast, ...updates };
      this.toasts.set(id, updatedToast);
      this.notifyListeners();
    }
  }

  /**
   * Get toast type from error category and severity
   */
  private getToastTypeFromError(
    error: CentralizedError,
  ): "error" | "warning" | "info" {
    switch (error.category) {
      case ErrorCategory.AUTHENTICATION_ERROR:
      case ErrorCategory.AUTHORIZATION_ERROR:
      case ErrorCategory.SERVER_ERROR:
        return "error";

      case ErrorCategory.NETWORK_ERROR:
      case ErrorCategory.VALIDATION_ERROR:
        return error.severity === ErrorSeverity.HIGH ? "error" : "warning";

      case ErrorCategory.BUSINESS_LOGIC_ERROR:
        return "info";

      default:
        return error.severity === ErrorSeverity.CRITICAL ? "error" : "warning";
    }
  }

  /**
   * Get default toast title based on error
   */
  private getDefaultTitle(error: CentralizedError): string {
    switch (error.category) {
      case ErrorCategory.NETWORK_ERROR:
        return "Connection Error";
      case ErrorCategory.AUTHENTICATION_ERROR:
        return "Authentication Required";
      case ErrorCategory.AUTHORIZATION_ERROR:
        return "Access Denied";
      case ErrorCategory.VALIDATION_ERROR:
        return "Invalid Input";
      case ErrorCategory.BUSINESS_LOGIC_ERROR:
        return "Notice";
      case ErrorCategory.SERVER_ERROR:
        return "Server Error";
      default:
        return "Error";
    }
  }

  /**
   * Get default duration based on toast type
   */
  private getDefaultDuration(type: ToastConfig["type"]): number {
    switch (type) {
      case "success":
        return 4000;
      case "error":
        return 8000;
      case "warning":
        return 6000;
      case "info":
        return 5000;
      default:
        return 5000;
    }
  }

  /**
   * Generate unique toast ID
   */
  private generateToastId(): string {
    return `toast-${++this.toastIdCounter}-${Date.now()}`;
  }

  /**
   * Notify all listeners of toast changes
   */
  private notifyListeners(): void {
    const toasts = this.getAllToasts();
    this.listeners.forEach((listener) => {
      try {
        listener(toasts);
      } catch (error) {
        console.error("[ToastManager] Error in listener callback:", error);
      }
    });
  }

  /**
   * Get toast statistics
   */
  public getStats(): {
    total: number;
    byType: Record<string, number>;
    oldest?: ToastConfig;
    newest?: ToastConfig;
  } {
    const toasts = this.getAllToasts();
    const byType: Record<string, number> = {
      success: 0,
      error: 0,
      warning: 0,
      info: 0,
    };

    toasts.forEach((toast) => {
      byType[toast.type]++;
    });

    return {
      total: toasts.length,
      byType,
      oldest: toasts[0],
      newest: toasts[toasts.length - 1],
    };
  }
}

// Export singleton instance for easy access
export const toastManager = ToastManager.getInstance();
