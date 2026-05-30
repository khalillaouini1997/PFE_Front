import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';

export interface ErrorContext {
  error: Error | HttpErrorResponse;
  component?: string;
  action?: string;
  userMessage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private readonly router = inject(Router);
  private readonly errors = signal<ErrorContext[]>([]);

  readonly errors$ = this.errors.asReadonly();

  handleError(context: ErrorContext) {
    console.error('[ErrorHandler]', context);

    // Add to error log
    this.errors.update(errors => [...errors, { ...context, timestamp: new Date() }]);

    // Show user-friendly message
    const userMessage = context.userMessage || this.getDefaultErrorMessage(context.error);
    
    // Navigate to error page for critical errors
    if (this.isCriticalError(context.error)) {
      this.router.navigate(['/error'], { 
        queryParams: { 
          message: userMessage,
          component: context.component 
        }
      });
    }

    return throwError(() => context.error);
  }

  private isCriticalError(error: Error | HttpErrorResponse): boolean {
    if (error instanceof HttpErrorResponse) {
      return error.status >= 500 || error.status === 403;
    }
    return false;
  }

  private getDefaultErrorMessage(error: Error | HttpErrorResponse): string {
    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 0:
          return 'Network error. Please check your connection.';
        case 401:
          return 'Session expired. Please login again.';
        case 403:
          return 'Access denied. You don\'t have permission.';
        case 404:
          return 'Resource not found.';
        case 500:
          return 'Server error. Please try again later.';
        default:
          return 'An error occurred. Please try again.';
      }
    }
    return 'An unexpected error occurred.';
  }

  clearErrors() {
    this.errors.set([]);
  }
}
