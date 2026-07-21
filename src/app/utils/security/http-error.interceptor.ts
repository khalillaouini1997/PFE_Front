import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {catchError, retry, throwError, timer} from 'rxjs';
import {isProblemDetail} from '../../shared/models/problem-detail.model';

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
      const errorMessage = extractErrorMessage(error);

      if (error.status === 401) {
        return throwError(() => error);
      }

      if (error.status === 403) {
        router.navigate(['/error'], {queryParams: {code: 403, message: errorMessage}});
        return throwError(() => error);
      }

      if (error.status === 404) {
        return throwError(() => error);
      }

      if (error.status >= 500) {
        // 5xx: show error banner
        triggerErrorBanner('server', errorMessage || 'Server error occurred');
        return throwError(() => error);
      }

      if (!error.status && error.error instanceof ProgressEvent) {
        triggerErrorBanner('network', 'Network error. Please check your connection.');
        return throwError(() => new Error('Network error. Please check your connection.'));
      }

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
  if (!error.status && error.error instanceof ProgressEvent) {
    return true;
  }

  if (error.status >= 500 && error.status !== 501) {
    return true;
  }

  if (error.status === 429) {
    return true;
  }

  return false;
}

/**
 * Trigger error banner via custom event
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
 * Extract error message from ProblemDetail (RFC 7807) or ApiResponse
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

  // Legacy ApiResponse
  if (errorBody.message) {
    return errorBody.message;
  }

  if (errorBody.error) {
    return errorBody.error;
  }

  return error.message || 'An error occurred';
}
