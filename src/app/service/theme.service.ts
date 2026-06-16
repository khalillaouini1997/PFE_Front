import { Injectable, signal, effect } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private document = inject(DOCUMENT);
  private readonly THEME_KEY = 'theme';
  
  // Signal for current theme
  currentTheme = signal<Theme>(this.getStoredTheme());
  
  constructor() {
    // Apply theme on initialization
    this.applyTheme(this.currentTheme());
    
    // Watch for theme changes and apply them
    effect(() => {
      this.applyTheme(this.currentTheme());
    });
  }
  
  private getStoredTheme(): Theme {
    const stored = localStorage.getItem(this.THEME_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    
    // Check system preference
    if (this.prefersDarkMode()) {
      return 'dark';
    }
    
    return 'light';
  }
  
  private prefersDarkMode(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  
  toggleTheme(): void {
    const newTheme: Theme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.currentTheme.set(newTheme);
    localStorage.setItem(this.THEME_KEY, newTheme);
  }
  
  private applyTheme(theme: Theme): void {
    const htmlElement = this.document.documentElement;
    
    // Remove both classes first
    htmlElement.classList.remove('light-theme', 'dark-theme');
    
    // Add the appropriate theme class
    htmlElement.classList.add(`${theme}-theme`);
    
    // Set data attribute for CSS selectors (PrimeNG & custom)
    htmlElement.setAttribute('data-theme', theme);
    
    // Set data attribute for Bootstrap 5.3
    htmlElement.setAttribute('data-bs-theme', theme);
  }
  
  isDarkMode(): boolean {
    return this.currentTheme() === 'dark';
  }
}
