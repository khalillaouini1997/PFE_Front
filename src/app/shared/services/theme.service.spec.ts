import {TestBed} from '@angular/core/testing';
import {DOCUMENT, PLATFORM_ID} from '@angular/core';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ThemeService} from './theme.service';

describe('ThemeService', () => {
  let localStorageStore: Record<string, string> = {};
  let mediaQueryListeners: ((e: any) => void)[] = [];
  let mockMediaQuery: any;
  let origLocalStorage: Storage;

  beforeEach(() => {
    localStorageStore = {};
    mediaQueryListeners = [];
    mockMediaQuery = {
      matches: false,
      addEventListener: vi.fn((_: string, cb: (e: any) => void) => {
        mediaQueryListeners.push(cb);
      }),
    };
    origLocalStorage = window.localStorage;
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
          localStorageStore[key] = value;
        }),
        removeItem: vi.fn(),
        clear: vi.fn(),
        get length() {
          return Object.keys(localStorageStore).length;
        },
        key: vi.fn(),
      },
      writable: true,
    });
    (window as any).matchMedia = vi.fn(() => mockMediaQuery);
    delete document.documentElement.dataset['theme'];
  });

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {value: origLocalStorage, writable: true});
    vi.restoreAllMocks();
  });

  function createService(platformId: string) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        {provide: PLATFORM_ID, useValue: platformId},
        {provide: DOCUMENT, useValue: document},
      ],
    });
    return TestBed.inject(ThemeService);
  }

  describe('SSR platform', () => {
    it('init() should be a no-op', () => {
      const service = createService('server');
      expect(() => service.init()).not.toThrow();
    });

    it('getTheme() should return light', () => {
      const service = createService('server');
      expect(service.getTheme()).toBe('light');
    });

    it('setTheme() should not touch localStorage', () => {
      const service = createService('server');
      service.setTheme('dark');
      expect(localStorageStore['theme']).toBeUndefined();
    });

    it('setTheme() should apply to document', () => {
      const service = createService('server');
      service.setTheme('dark');
      expect(document.documentElement.dataset['theme']).toBe('dark');
    });
  });

  describe('Browser platform', () => {
    it('init() with saved theme should apply it', () => {
      localStorageStore['theme'] = 'dark';
      const service = createService('browser');
      service.init();
      expect(document.documentElement.dataset['theme']).toBe('dark');
    });

    it('init() without saved theme should use OS preference dark', () => {
      mockMediaQuery.matches = true;
      const service = createService('browser');
      service.init();
      expect(document.documentElement.dataset['theme']).toBe('dark');
    });

    it('init() without saved theme and light OS preference', () => {
      mockMediaQuery.matches = false;
      const service = createService('browser');
      service.init();
      expect(document.documentElement.dataset['theme']).toBe('light');
    });

    it('getTheme() from localStorage', () => {
      localStorageStore['theme'] = 'dark';
      const service = createService('browser');
      expect(service.getTheme()).toBe('dark');
    });

    it('getTheme() from mediaQuery fallback when no localStorage', () => {
      mockMediaQuery.matches = true;
      const service = createService('browser');
      expect(service.getTheme()).toBe('dark');
    });

    it('getTheme() defaults to light when no localStorage and light OS preference', () => {
      mockMediaQuery.matches = false;
      const service = createService('browser');
      expect(service.getTheme()).toBe('light');
    });

    it('toggle() should switch from light to dark', () => {
      localStorageStore['theme'] = 'light';
      const service = createService('browser');
      service.toggle();
      expect(localStorageStore['theme']).toBe('dark');
    });

    it('toggle() should switch from dark to light', () => {
      localStorageStore['theme'] = 'dark';
      const service = createService('browser');
      service.toggle();
      expect(localStorageStore['theme']).toBe('light');
    });

    it('setTheme() should write to localStorage and apply', () => {
      const service = createService('browser');
      service.setTheme('dark');
      expect(localStorageStore['theme']).toBe('dark');
      expect(document.documentElement.dataset['theme']).toBe('dark');
    });

    it('constructor mediaQuery change event should apply new OS theme when no localStorage', () => {
      const service = createService('browser');
      expect(mediaQueryListeners.length).toBeGreaterThan(0);
      mediaQueryListeners[0]({matches: true});
      expect(document.documentElement.dataset['theme']).toBe('dark');
    });

    it('constructor mediaQuery change event should NOT change theme when localStorage set', () => {
      localStorageStore['theme'] = 'light';
      const service = createService('browser');
      document.documentElement.dataset['theme'] = 'light';
      mediaQueryListeners[0]({matches: true});
      expect(document.documentElement.dataset['theme']).toBe('light');
    });
  });
});
