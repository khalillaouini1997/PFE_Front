import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoadingService]
    });
    service = TestBed.inject(LoadingService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not be loading by default', () => {
    expect(service.isLoading()).toBe(false);
  });

  it('should set loading state', () => {
    service.setLoading('test', true, 'Loading...');
    expect(service.isLoading()).toBe(true);
    expect(service.loadingMessage()).toBe('Loading...');
  });

  it('should remove loading state', () => {
    service.setLoading('test', true);
    service.setLoading('test', false);
    expect(service.isLoading()).toBe(false);
  });

  it('should handle multiple loading states', () => {
    service.setLoading('a', true);
    service.setLoading('b', true);
    expect(service.isLoading()).toBe(true);
    service.setLoading('a', false);
    expect(service.isLoading()).toBe(true);
    service.setLoading('b', false);
    expect(service.isLoading()).toBe(false);
  });

  it('should return first loading message', () => {
    service.setLoading('a', true, 'First');
    service.setLoading('b', true, 'Second');
    expect(service.loadingMessage()).toBe('First');
  });

  it('should return default message when no loading', () => {
    expect(service.loadingMessage()).toBe('Loading...');
  });

  it('should get loading state by key', () => {
    service.setLoading('test', true, 'msg');
    const state = service.getLoadingState('test');
    expect(state).toBeTruthy();
    expect(state?.isLoading).toBe(true);
    expect(state?.message).toBe('msg');
  });

  it('should return undefined for non-existent key', () => {
    expect(service.getLoadingState('nonexistent')).toBeUndefined();
  });

  it('should clear all', () => {
    service.setLoading('a', true);
    service.setLoading('b', true);
    service.clearAll();
    expect(service.isLoading()).toBe(false);
  });
});
