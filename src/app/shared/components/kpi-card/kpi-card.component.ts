import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-card.component.html',
  styleUrls: ['./kpi-card.component.css']
})
export class KpiCardComponent {
  label = input.required<string>();
  value = input.required<number | string>();
  icon = input('📊');
  trend = input<'up' | 'down' | null>(null);
  trendValue = input(0);
  showSparkline = input(false);
}
