import { Component, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export type ErrorType = 'network' | 'timeout' | 'server' | 'client' | 'unknown';

export interface ErrorContext {
  type: ErrorType;
  message: string;
  retryable: boolean;
  suggestedAction: string;
}

@Component({
  selector: 'app-error-boundary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-boundary.component.html',
  styleUrls: ['./error-boundary.component.css']
})
export class ErrorBoundaryComponent {
  error = input<Error | null>(null);
  showDetails = input<boolean>(false);
  retry = output<void>();
  
  private readonly router = inject(Router);

  errorContext = computed(() => this.analyzeError(this.error()));

  private analyzeError(error: Error | null): ErrorContext | null {
    if (!error) return null;

    const message = error.message.toLowerCase();
    let type: ErrorType = 'unknown';
    let retryable = true;
    let suggestedAction = 'Try refreshing the page';

    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      type = 'network';
      retryable = true;
      suggestedAction = 'Check your internet connection and retry';
    } else if (message.includes('timeout') || message.includes('timed out')) {
      type = 'timeout';
      retryable = true;
      suggestedAction = 'The request took too long. Please try again';
    } else if (message.includes('500') || message.includes('server error') || message.includes('internal server')) {
      type = 'server';
      retryable = true;
      suggestedAction = 'Our servers are experiencing issues. Please try again';
    } else if (message.includes('404') || message.includes('not found')) {
      type = 'client';
      retryable = false;
      suggestedAction = 'The requested resource was not found';
    }

    return {
      type,
      message: error.message || 'An unexpected error occurred',
      retryable,
      suggestedAction
    };
  }

  onRetry() {
    this.retry.emit();
  }

  onGoHome() {
    this.router.navigate(['/adminWeb/dashboard']);
  }

  onKeydown(event: KeyboardEvent) {
    // ESC key handling is done at parent level via showDetails input
    if (event.key === 'Escape') {
      // Parent component should handle this via showDetails input
    }
  }

  getIcon(): string {
    const context = this.errorContext();
    switch (context?.type) {
      case 'network':
        return 'wifi_off';
      case 'timeout':
        return 'schedule';
      case 'server':
        return 'error';
      case 'client':
        return 'link_off';
      default:
        return 'warning';
    }
  }

  getSeverity(): 'error' | 'warning' | 'info' {
    const context = this.errorContext();
    switch (context?.type) {
      case 'server':
      case 'client':
        return 'error';
      case 'network':
      case 'timeout':
        return 'warning';
      default:
        return 'info';
    }
  }
}
