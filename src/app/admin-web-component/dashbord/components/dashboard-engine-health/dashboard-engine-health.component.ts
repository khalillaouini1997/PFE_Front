import { Component, input, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RealTime } from '../../../../data/data';

@Component({
  selector: 'app-dashboard-engine-health',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-engine-health.component.html',
  styleUrls: ['./dashboard-engine-health.component.css']
})
export class DashboardEngineHealthComponent {
  realtimes = input<RealTime[]>([]);

  constructor() {
    effect(() => {
      this.realtimes();
    });
  }

  getEngineHealthData() {
    const r = this.realtimes() as any[];
    return r.slice(0, 12).map(t => ({
      matricule: t.matricule,
      deviceid: t.deviceid,
      temperature: t.temp_engine || 0,
      rpm: t.rpm || 0,
      fuelRate: t.fuel_rate || 0,
      health: this.calculateHealth(t)
    }));
  }

  private calculateHealth(vehicle: any): 'healthy' | 'warning' | 'critical' {
    const temp = vehicle.temp_engine || 0;
    const rpm = vehicle.rpm || 0;
    
    if (temp > 100 || rpm > 5000) return 'critical';
    if (temp > 80 || rpm > 4000) return 'warning';
    return 'healthy';
  }

  getHealthColor(health: string): string {
    switch (health) {
      case 'healthy': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'critical': return '#f43f5e';
      default: return '#a3aed0';
    }
  }

  getHealthIcon(health: string): string {
    switch (health) {
      case 'healthy': return '✓';
      case 'warning': return '⚠';
      case 'critical': return '✗';
      default: return '?';
    }
  }
}
