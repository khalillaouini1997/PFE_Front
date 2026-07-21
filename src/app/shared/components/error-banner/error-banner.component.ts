import {AfterViewInit, Component, computed, inject, OnDestroy, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';

export type ErrorType = 'network' | 'server' | 'map-tile' | 'data-fetch' | 'timeout';

export interface ErrorBannerData {
  type: ErrorType;
  message: string;
  retryAction?: () => void;
  dismissible?: boolean;
  autoDismiss?: boolean;
}

@Component({
  selector: 'app-error-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-banner.component.html',
  styleUrls: ['./error-banner.component.css']
})
export class ErrorBannerComponent implements AfterViewInit, OnDestroy {
  error = signal<ErrorBannerData | null>(null);
  isVisible = computed(() => this.error() !== null);
  private readonly router = inject(Router);
  private dismissTimer?: number;
  private ngAfterViewInitCalled = false;

  ngAfterViewInit() {
    this.ngAfterViewInitCalled = true;
  }

  ngOnDestroy() {
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
    }
  }

  showError(data: ErrorBannerData) {
    this.error.set(data);

    if (data.autoDismiss !== false) {
      if (this.dismissTimer) {
        clearTimeout(this.dismissTimer);
      }
      this.dismissTimer = window.setTimeout(() => {
        this.dismiss();
      }, 10000);
    }
  }

  dismiss() {
    this.error.set(null);
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
    }
  }

  onRetry() {
    const currentError = this.error();
    if (currentError?.retryAction) {
      currentError.retryAction();
      this.dismiss();
    }
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.dismiss();
    } else if (event.key === 'Enter' || event.key === ' ') {
      this.onRetry();
    }
  }

  getIcon(): string {
    const type = this.error()?.type;
    switch (type) {
      case 'network':
        return 'wifi_off';
      case 'server':
        return 'error';
      case 'map-tile':
        return 'map';
      case 'data-fetch':
        return 'cloud_off';
      case 'timeout':
        return 'schedule';
      default:
        return 'warning';
    }
  }

  getSeverity(): 'warning' | 'error' | 'info' {
    const type = this.error()?.type;
    switch (type) {
      case 'server':
        return 'error';
      case 'network':
      case 'map-tile':
        return 'warning';
      default:
        return 'info';
    }
  }
}
