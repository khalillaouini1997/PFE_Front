import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardVariant = 'default' | 'elevated' | 'bordered';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent {
  variant = input<CardVariant>('default');
  padding = input<'sm' | 'md' | 'lg' | 'xl'>('lg');
  hoverable = input<boolean>(false);
}
