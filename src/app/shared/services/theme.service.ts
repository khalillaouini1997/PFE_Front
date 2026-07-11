import { Injectable, inject, PLATFORM_ID, DOCUMENT } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private mediaQuery: MediaQueryList | null = null;

  constructor() {
    if (this.isBrowser) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQuery.addEventListener('change', (e) => {
        if (!localStorage.getItem(STORAGE_KEY)) {
          this.apply(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  init(): void {
    if (!this.isBrowser) return;
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (saved) {
      this.apply(saved);
    } else {
      const prefersDark = this.mediaQuery?.matches ?? false;
      this.apply(prefersDark ? 'dark' : 'light');
    }
  }

  getTheme(): Theme {
    if (!this.isBrowser) return 'light';
    return (localStorage.getItem(STORAGE_KEY) as Theme) || (this.mediaQuery?.matches ? 'dark' : 'light');
  }

  toggle(): void {
    const next: Theme = this.getTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }

  setTheme(theme: Theme): void {
    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEY, theme);
    }
    this.apply(theme);
  }

  private apply(theme: Theme): void {
    this.document.documentElement.setAttribute('data-theme', theme);
  }
}
