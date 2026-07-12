import { ElementRef } from '@angular/core';
import { Chart, ChartType } from 'chart.js';

export interface ChartConfig {
  type: ChartType;
  data: any;
  options?: any;
}

export function updateOrCreateChart(
  canvasRef: ElementRef | undefined,
  instance: Chart | undefined,
  config: ChartConfig
): Chart | undefined {
  if (!canvasRef) return instance;
  if (instance) {
    try {
      instance.data = config.data;
      instance.update('none');
    } catch {
      return instance;
    }
    return instance;
  }
  try {
    return new Chart(canvasRef.nativeElement, {
      type: config.type,
      data: config.data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        ...config.options
      }
    });
  } catch {
    return undefined;
  }
}
