import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RealTime } from '../../../../data/data';

@Component({
  selector: 'app-dashboard-speed-leaders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-speed-leaders.component.html',
  styleUrls: ['./dashboard-speed-leaders.component.css']
})
export class DashboardSpeedLeadersComponent {
  realtimes = input<RealTime[]>([]);

  // Use a computed signal instead of a method call in the template
  // to avoid re-computing on every change detection cycle
  readonly topSpeedVehicles = computed(() => {
    const r = this.realtimes() as any[];
    return r
      .filter(t => t.speed > 0)
      .sort((a, b) => b.speed - a.speed)
      .slice(0, 5);
  });

  getSpeedColor(speed: number): string {
    if (speed > 100) return '#f43f5e';
    if (speed > 60) return '#f59e0b';
    return '#10b981';
  }
}
