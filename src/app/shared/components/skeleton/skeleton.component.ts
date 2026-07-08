import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.css']
})
export class SkeletonComponent {
  variant = input<'text' | 'circular' | 'rectangular' | 'card' | 'table-row'>('text');
  width = input<string>('100%');
  height = input<string | number>('auto');
  lines = input<number>(3);
  count = input<number>(1);
  className = input<string>('');

  getArray(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i);
  }
}
