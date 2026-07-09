import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { ApplicationRef } from '@angular/core';
import { vi } from 'vitest';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let mockDocument: Document;
  let mockHtmlElement: any;

  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      })),
    });
    localStorage.clear();

    const classList = {
      add: vi.fn(),
      remove: vi.fn(),
    };
    mockHtmlElement = {
      setAttribute: vi.fn(),
      removeAttribute: vi.fn(),
      classList,
      dataset: {} as Record<string, string>,
    };

    mockDocument = {
      documentElement: mockHtmlElement,
    } as unknown as Document;

    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        { provide: DOCUMENT, useValue: mockDocument },
      ],
    });
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('toggleTheme', () => {
    it('should switch from light to dark', () => {
      service.currentTheme.set('light');
      service.toggleTheme();
      expect(service.currentTheme()).toBe('dark');
      expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('should switch from dark to light', () => {
      service.currentTheme.set('dark');
      service.toggleTheme();
      expect(service.currentTheme()).toBe('light');
      expect(localStorage.getItem('theme')).toBe('light');
    });
  });

  describe('isDarkMode', () => {
    it('should return true when theme is dark', () => {
      service.currentTheme.set('dark');
      expect(service.isDarkMode()).toBe(true);
    });

    it('should return false when theme is light', () => {
      service.currentTheme.set('light');
      expect(service.isDarkMode()).toBe(false);
    });
  });

  describe('applyTheme', () => {
    it('should set data-theme attribute on documentElement', () => {
      service.currentTheme.set('light');
      service.toggleTheme();
      TestBed.flushEffects();

      expect(mockHtmlElement.dataset['theme']).toBe('dark');
      expect(mockHtmlElement.dataset['bsTheme']).toBe('dark');
    });

    it('should remove old theme classes and add new ones', () => {
      service.toggleTheme();
      TestBed.flushEffects();
      expect(mockHtmlElement.classList.remove).toHaveBeenCalledWith('light-theme', 'dark-theme');
      expect(mockHtmlElement.classList.add).toHaveBeenCalledWith('dark-theme');
    });
  });

  describe('getStoredTheme', () => {
    it('should return light when localStorage has no theme', () => {
      localStorage.removeItem('theme');
      const freshService = TestBed.inject(ThemeService);
      expect(freshService.currentTheme()).toBe('light');
    });

    it('should return stored theme from localStorage', () => {
      localStorage.setItem('theme', 'dark');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ThemeService,
          { provide: DOCUMENT, useValue: mockDocument },
        ],
      });
      const freshService = TestBed.inject(ThemeService);
      expect(freshService.currentTheme()).toBe('dark');
    });
  });
});
