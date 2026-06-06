import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';

export interface ErrorContext {
  error: Error | HttpErrorResponse;
  component?: string;
  action?: string;
  userMessage?: string;
  timestamp?: Date;
  errorType?: 'network' | 'validation' | 'business' | 'system';
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private readonly router = inject(Router);
  private readonly errors = signal<ErrorContext[]>([]);

  readonly errors$ = this.errors.asReadonly();

  handleError(context: ErrorContext) {
    // Auto-categorize error type if not provided
    if (!context.errorType) {
      context.errorType = this.categorizeError(context.error);
    }

    console.error('[ErrorHandler]', context);

    // Add to error log with timestamp
    this.errors.update(errors => [...errors, { ...context, timestamp: new Date() }]);

    // Show user-friendly message
    const userMessage = context.userMessage || this.getDefaultErrorMessage(context.error);
    
    // Navigate to error page for critical errors
    if (this.isCriticalError(context.error)) {
      this.router.navigate(['/error'], { 
        queryParams: { 
          message: userMessage,
          component: context.component,
          type: context.errorType
        }
      });
    }

    return throwError(() => context.error);
  }

  private categorizeError(error: Error | HttpErrorResponse): 'network' | 'validation' | 'business' | 'system' {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0 || error.status >= 500) {
        return 'network';
      }
      if (error.status >= 400 && error.status < 500) {
        return 'validation';
      }
    }
    if (error.message?.includes('network') || error.message?.includes('connection')) {
      return 'network';
    }
    if (error.message?.includes('validation') || error.message?.includes('invalid')) {
      return 'validation';
    }
    return 'system';
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

  getErrorsByType(errorType: 'network' | 'validation' | 'business' | 'system'): ErrorContext[] {
    return this.errors().filter(e => e.errorType === errorType);
  }

  getRecentErrors(count: number = 10): ErrorContext[] {
    return this.errors().slice(-count);
  }
}
