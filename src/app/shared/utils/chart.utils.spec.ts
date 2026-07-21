import {updateOrCreateChart} from './chart.utils';

describe('chart.utils', () => {
  describe('updateOrCreateChart', () => {
    it('should return undefined when no canvasRef', () => {
      const result = updateOrCreateChart(undefined, undefined, {type: 'bar', data: {labels: [], datasets: []}});
      expect(result).toBeUndefined();
    });

    it('should return existing instance when no canvasRef', () => {
      const existingChart = {data: {}, update: vi.fn()} as any;
      const result = updateOrCreateChart(undefined, existingChart, {type: 'bar', data: {labels: [], datasets: []}});
      expect(result).toBe(existingChart);
    });

    it('should update existing chart data', () => {
      const mockUpdate = vi.fn();
      const existingChart = {data: {}, update: mockUpdate} as any;
      const canvasRef = {nativeElement: document.createElement('canvas')} as any;
      const config = {type: 'bar' as const, data: {labels: ['a'], datasets: [{data: [1]}]}};

      const result = updateOrCreateChart(canvasRef, existingChart, config);
      expect(result).toBe(existingChart);
      expect(mockUpdate).toHaveBeenCalledWith('none');
    });

    it('should handle update error gracefully', () => {
      const existingChart = {data: {}, update: vi.fn(() => { throw new Error('fail'); })} as any;
      const canvasRef = {nativeElement: document.createElement('canvas')} as any;
      const config = {type: 'bar' as const, data: {labels: [], datasets: []}};

      const result = updateOrCreateChart(canvasRef, existingChart, config);
      expect(result).toBe(existingChart);
    });

    it('should create new chart when no existing instance', () => {
      const canvasRef = {nativeElement: document.createElement('canvas')} as any;
      const config = {type: 'doughnut' as const, data: {labels: ['a'], datasets: [{data: [1]}]}};

      const result = updateOrCreateChart(canvasRef, undefined, config);
      expect(result).toBeDefined();
    });
  });
});
