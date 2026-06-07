import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../service/auth.service';
import { ProblemDetail, isProblemDetail } from '../../shared/models/problem-detail.model';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Extract error message from ProblemDetail or ApiResponse format
      const errorMessage = extractErrorMessage(error);

      if (error.status === 401) {
        // Token expired or invalid
        authService.logout();
        router.navigate(['/authentification']);
        return throwError(() => error);
      }

      if (error.status === 403) {
        // Forbidden - user doesn't have access
        router.navigate(['/error'], { queryParams: { code: 403, message: errorMessage } });
        return throwError(() => error);
      }

      if (error.status === 404) {
        // Resource not found
        console.error(`Resource not found: ${req.url}`, errorMessage);
        return throwError(() => error);
      }

      if (error.status >= 500) {
        // Server error
        console.error('Server error:', error, errorMessage);
        return throwError(() => error);
      }

      // Network error
      if (!error.status && error.error instanceof ProgressEvent) {
        console.error('Network error - check your connection');
        return throwError(() => new Error('Network error. Please check your connection.'));
      }

      // Other errors with message
      if (errorMessage) {
        console.error('Error:', errorMessage);
      }

      return throwError(() => error);
    })
  );
};

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
