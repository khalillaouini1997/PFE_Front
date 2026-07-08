import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { getPlatform, destroyPlatform } from '@angular/core';

// Mock window.matchMedia for jsdom
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// Mock ResizeObserver for PrimeNG
if (!window.ResizeObserver) {
  (window as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Mock HTMLCanvasElement.getContext for Chart.js in jsdom
{
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (...args: any[]) {
    const ctx = originalGetContext.call(this, ...args as [string, any?]);
    if (ctx) return ctx;
    if (!this.ownerDocument) {
      Object.defineProperty(this, 'ownerDocument', {
        value: { defaultView: window },
        writable: false,
      });
    }
    return {
      fillRect: () => {}, clearRect: () => {}, strokeRect: () => {},
      fillText: () => {}, strokeText: () => {},
      measureText: () => ({ width: 0 }),
      beginPath: () => {}, closePath: () => {},
      moveTo: () => {}, lineTo: () => {},
      stroke: () => {}, fill: () => {}, arc: () => {}, rect: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
      canvas: this,
      save: () => {}, restore: () => {},
      scale: () => {}, translate: () => {}, rotate: () => {},
      setLineDash: () => {},
      lineDashOffset: 0, shadowBlur: 0,
      globalAlpha: 1, strokeStyle: '#000', fillStyle: '#000',
      lineWidth: 1, font: '10px sans-serif',
      textAlign: 'start' as CanvasTextAlign, textBaseline: 'alphabetic' as CanvasTextBaseline,
    } as any;
  };
}

// Suppress Chart.js console warnings in jsdom
const originalError = console.error;
console.error = (...args: any[]) => {
  const msg = args[0]?.toString?.() ?? '';
  if (msg.includes('chart') || msg.includes('Chart') || msg.includes('getContext') || msg.includes('Not implemented')) {
    return;
  }
  originalError.apply(console, args);
};

// Mock window.getComputedStyle for Chart.js in jsdom
if (!window.getComputedStyle) {
  (window as any).getComputedStyle = () => ({
    getPropertyValue: () => '',
    fontSize: '14px',
    fontFamily: 'sans-serif',
    width: '300px',
    height: '150px',
  });
}

// Ensure exactly one platform is initialized
if (getPlatform()) {
  destroyPlatform();
}

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
  { teardown: { destroyAfterEach: true } }
);
