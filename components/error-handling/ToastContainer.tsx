/**
 * Toast Container Component
 * Displays toast notifications managed by ToastManager
 */

'use client';

import React, { useEffect, useState } from 'react';
import { toastManager, ToastConfig } from '../../lib/error-handler/toast-manager';
import { ErrorCategory } from '../../lib/error-handler/error-types';

interface ToastItemProps {
  toast: ToastConfig;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300); // Match animation duration
  };

  const getToastStyles = () => {
    const baseStyles = "transform transition-all duration-300 ease-in-out";
    
    if (!isVisible) {
      return `${baseStyles} translate-x-full opacity-0`;
    }
    
    if (isLeaving) {
      return `${baseStyles} translate-x-full opacity-0`;
    }
    
    return `${baseStyles} translate-x-0 opacity-100`;
  };

  const getToastColors = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-emerald-500 border-emerald-600 text-white';
      case 'error':
        return 'bg-red-500 border-red-600 text-white';
      case 'warning':
        return 'bg-amber-500 border-amber-600 text-white';
      case 'info':
        return 'bg-blue-500 border-blue-600 text-white';
      default:
        return 'bg-slate-500 border-slate-600 text-white';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'notifications';
    }
  };

  return (
    <div
      className={`
        ${getToastStyles()}
        ${getToastColors()}
        border rounded-lg shadow-lg p-4 mb-3 flex items-start gap-3
        min-w-[320px] max-w-md
        backdrop-blur-sm
      `}
      role="alert"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        <span className="material-symbols-outlined text-xl">
          {getIcon()}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm mb-1">
          {toast.title}
        </h4>
        {toast.message && (
          <p className="text-sm opacity-90 break-words">
            {toast.message}
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
        aria-label="Close notification"
      >
        <span className="material-symbols-outlined text-lg">
          close
        </span>
      </button>

      {/* Action button */}
      {toast.action && (
        <button
          onClick={toast.action.onClick}
          className="flex-shrink-0 px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm font-medium transition-colors"
        >
          {toast.action.label}
        </button>
      )}
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);

  useEffect(() => {
    // Subscribe to toast updates
    const unsubscribe = toastManager.subscribe((newToasts) => {
      setToasts(newToasts);
    });

    return unsubscribe;
  }, []);

  const handleClose = (id: string) => {
    toastManager.removeToast(id);
  };

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 pointer-events-none"
      aria-label="Toast notifications"
    >
      <div className="pointer-events-auto space-y-2">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={handleClose}
          />
        ))}
      </div>
    </div>
  );
};

// Hook for easy toast access
export function useToast() {
  return {
    success: toastManager.showSuccess,
    error: toastManager.showError,
    warning: toastManager.showWarning,
    info: toastManager.showInfo,
    remove: toastManager.removeToast,
    clear: toastManager.clearAllToasts,
  };
}
