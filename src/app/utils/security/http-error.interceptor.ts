import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, retry, timer } from 'rxjs';
import { ProblemDetail, isProblemDetail } from '../../shared/models/problem-detail.model';

// Error tracking for retry logic
const retryableErrors = new Set<string>();
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    retry({
      count: MAX_RETRIES,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        // Only retry on network errors or 5xx server errors
        const shouldRetry = isRetryableError(error);
        
        if (shouldRetry && retryCount <= MAX_RETRIES) {
          return timer(RETRY_DELAY_MS * retryCount);
        }
        
        return throwError(() => error);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      // Extract error message from ProblemDetail or ApiResponse format
      const errorMessage = extractErrorMessage(error);

      if (error.status === 401) {
        return throwError(() => error);
      }

      if (error.status === 403) {
        // Forbidden - user doesn't have access
        router.navigate(['/error'], { queryParams: { code: 403, message: errorMessage } });
        return throwError(() => error);
      }

      if (error.status === 404) {
        // Resource not found
        return throwError(() => error);
      }

      if (error.status >= 500) {
        // Server error - trigger error banner
        triggerErrorBanner('server', errorMessage || 'Server error occurred');
        return throwError(() => error);
      }

      // Network error
      if (!error.status && error.error instanceof ProgressEvent) {
        triggerErrorBanner('network', 'Network error. Please check your connection.');
        return throwError(() => new Error('Network error. Please check your connection.'));
      }

      // Other errors with message
      if (errorMessage) {
        triggerErrorBanner('unknown', errorMessage);
      }

      return throwError(() => error);
    })
  );
};

/**
 * Determine if an error is retryable
 */
function isRetryableError(error: HttpErrorResponse): boolean {
  // Retry on network errors
  if (!error.status && error.error instanceof ProgressEvent) {
    return true;
  }
  
  // Retry on 5xx server errors (except 501 Not Implemented)
  if (error.status >= 500 && error.status !== 501) {
    return true;
  }
  
  // Retry on 429 Too Many Requests
  if (error.status === 429) {
    return true;
  }
  
  return false;
}

/**
 * Trigger error banner via custom event
 * This will be caught by the app component to show the error banner
 */
function triggerErrorBanner(type: 'network' | 'server' | 'map-tile' | 'data-fetch' | 'timeout' | 'unknown', message: string) {
  const event = new CustomEvent('show-error-banner', {
    detail: {
      type,
      message,
      dismissible: true,
      autoDismiss: true
    }
  });
  window.dispatchEvent(event);
}

/**
 * Extract error message from either ProblemDetail (RFC 7807) or ApiResponse format
 */
function extractErrorMessage(error: HttpErrorResponse): string {
  const errorBody = error.error;
  
  if (!errorBody) {
    return error.message || 'An error occurred';
  }

  // Check for ProblemDetail format (RFC 7807)
  if (isProblemDetail(errorBody)) {
    return errorBody.detail || errorBody.title || error.message;
  }

  // Check for ApiResponse format (legacy)
  if (errorBody.message) {
    return errorBody.message;
  }

  if (errorBody.error) {
    return errorBody.error;
  }

  return error.message || 'An error occurred';
}
