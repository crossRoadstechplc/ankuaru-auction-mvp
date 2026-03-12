/**
 * CSRF Protection Module Index
 * 
 * Central exports for all CSRF protection functionality
 */

import { initializeCSRF } from "./csrf-manager";

// Export main classes and utilities
export {
  CSRFManager,
  csrfManager,
  initializeCSRF,
  needsCSRFProtection,
  addCSRFToFormData,
  addCSRFToSearchParams,
} from './csrf-manager';

// Export types and interfaces
export type {
  CSRFToken,
  CSRFConfig,
  CSRFValidationResult,
} from './csrf-manager';

// Create and export a global CSRF manager instance
export const globalCSRFManager = initializeCSRF();
