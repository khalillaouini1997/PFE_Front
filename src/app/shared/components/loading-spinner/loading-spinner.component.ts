import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.css']
})
export class LoadingSpinnerComponent {
  isLoading = input<boolean>(false);
  message = input<string>('Loading...');
  size = input<'small' | 'medium' | 'large'>('medium');
  overlay = input<boolean>(true);
}
