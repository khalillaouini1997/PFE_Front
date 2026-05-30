import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

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

  onRetry() {
    this.retry.emit();
  }

  onGoHome() {
    this.router.navigate(['/adminWeb/dashboard']);
  }
}
