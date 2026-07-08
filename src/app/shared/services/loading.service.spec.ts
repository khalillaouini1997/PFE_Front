import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [LoadingService],
    });
    service = TestBed.inject(LoadingService);
  });

  describe('setLoading', () => {
    it('should add loading state when isLoading is true', () => {
      service.setLoading('test', true, 'Loading data...');

      const state = service.getLoadingState('test');
      expect(state).toBeDefined();
      expect(state?.key).toBe('test');
      expect(state?.isLoading).toBe(true);
      expect(state?.message).toBe('Loading data...');
    });

    it('should remove loading state when isLoading is false', () => {
      service.setLoading('test', true);
      service.setLoading('test', false);

      const state = service.getLoadingState('test');
      expect(state).toBeUndefined();
    });
  });

  describe('getLoadingState', () => {
    it('should return undefined for non-existent key', () => {
      expect(service.getLoadingState('nonexistent')).toBeUndefined();
    });

    it('should return the loading state for existing key', () => {
      service.setLoading('data', true, 'Fetching');
      const state = service.getLoadingState('data');
      expect(state?.isLoading).toBe(true);
    });
  });

  describe('clearAll', () => {
    it('should remove all loading states', () => {
      service.setLoading('a', true);
      service.setLoading('b', true);

      service.clearAll();

      expect(service.getLoadingState('a')).toBeUndefined();
      expect(service.getLoadingState('b')).toBeUndefined();
    });
  });

  describe('isLoading signal', () => {
    it('should be false when no loading states', () => {
      expect(service.isLoading()).toBe(false);
    });

    it('should be true when any state is loading', () => {
      service.setLoading('test', true);
      expect(service.isLoading()).toBe(true);
    });

    it('should be false when all loading states are removed', () => {
      service.setLoading('test', true);
      service.setLoading('test', false);
      expect(service.isLoading()).toBe(false);
    });

    it('should be true when multiple states and at least one is loading', () => {
      service.setLoading('a', true);
      service.setLoading('b', false);
      expect(service.isLoading()).toBe(true);
    });
  });

  describe('loadingMessage signal', () => {
    it('should return default message when no loading states', () => {
      expect(service.loadingMessage()).toBe('Loading...');
    });

    it('should return message from first loading state', () => {
      service.setLoading('test', true, 'Saving...');
      expect(service.loadingMessage()).toBe('Saving...');
    });

    it('should return first loading state message when multiple exist', () => {
      service.setLoading('a', true, 'First');
      service.setLoading('b', true, 'Second');
      expect(service.loadingMessage()).toBe('First');
    });
  });
});
