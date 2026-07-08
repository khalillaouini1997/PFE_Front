import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit {
  errorCode: number | null = null;
  errorMessage: string = '';
  component: string = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.errorCode = params['code'] ? +params['code'] : null;
      this.errorMessage = params['message'] || '';
      this.component = params['component'] || '';
      
      if (!this.errorMessage && this.errorCode) {
        this.errorMessage = this.getDefaultErrorMessage(this.errorCode);
      }
    });
  }

  private getDefaultErrorMessage(code: number): string {
    switch (code) {
      case 401:
        return 'Session expired. Please login again.';
      case 403:
        return 'Access denied. You don\'t have permission to access this resource.';
      case 404:
        return 'Resource not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return 'An unexpected error occurred.';
    }
  }

  goHome() {
    this.router.navigate(['/adminWeb/dashboard']);
  }

  goBack() {
    this.router.navigate(['/authentification']);
  }
}
