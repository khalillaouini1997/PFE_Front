import 'zone.js';
import 'zone.js/testing';

// Mock window.matchMedia for jsdom
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {
      },
      removeListener: () => {
      },
      addEventListener: () => {
      },
      removeEventListener: () => {
      },
      dispatchEvent: () => false,
    }),
  });
}

// Mock ResizeObserver for jsdom
if (!window.ResizeObserver) {
  (window as any).ResizeObserver = class {
    observe() {
    } // NOSONAR
    unobserve() {
    } // NOSONAR
    disconnect() {
    } // NOSONAR
  };
}

// Mock dialog methods for jsdom
if (typeof window !== 'undefined') {
  const mockMethods = (proto: any) => {
    if (proto) {
      if (!proto.showModal) {
        proto.showModal = function (this: any) {
          this.setAttribute('open', '');
        };
      }
      if (!proto.close) {
        proto.close = function (this: any) {
          this.removeAttribute('open');
        };
      }
    }
  };
  mockMethods(window.HTMLElement.prototype);
  mockMethods((window as any).HTMLDialogElement?.prototype);
  mockMethods((window as any).HTMLUnknownElement?.prototype);
}


// Mock getComputedStyle for Chart.js
const mockComputedStyle = {
  getPropertyValue: () => '',
  fontSize: '14px',
  fontFamily: 'sans-serif',
  width: '300px',
  height: '150px',
  display: 'block',
  visibility: 'visible',
  position: 'static',
  overflow: 'visible',
  boxSizing: 'content-box',
  borderStyle: 'none',
  borderWidth: '0px',
  padding: '0px',
  margin: '0px',
};
(window as any).getComputedStyle = (_el: any, _pseudo?: string | null) => mockComputedStyle;

// Mock canvas for Chart.js
{
  const origGetContext = HTMLCanvasElement.prototype.getContext;

  const mockParent = {
    ownerDocument: {defaultView: window},
    style: {},
    getBoundingClientRect: () => ({width: 300, height: 150, top: 0, left: 0, right: 300, bottom: 150}),
    addEventListener: () => {
    },
    removeEventListener: () => {
    },
    parentNode: null as any,
    parentElement: null as any,
  };
  mockParent.parentNode = mockParent;
  mockParent.parentElement = mockParent;

  Object.defineProperty(HTMLCanvasElement.prototype, 'parentElement', {
    get() {
      return mockParent;
    },
    configurable: true,
  });
  Object.defineProperty(HTMLCanvasElement.prototype, 'parentNode', {
    get() {
      return mockParent;
    },
    configurable: true,
  });
  Object.defineProperty(HTMLCanvasElement.prototype, 'ownerDocument', {
    value: {defaultView: window},
    configurable: true,
  });

  HTMLCanvasElement.prototype.getContext = function (...args: any[]) {
    const ctx = origGetContext.call(this, ...args as [string, any?]);
    if (ctx) return ctx;

    return {
      fillRect: () => {
      }, clearRect: () => {
      }, strokeRect: () => {
      },
      fillText: () => {
      }, strokeText: () => {
      },
      measureText: () => ({width: 0}),
      beginPath: () => {
      }, closePath: () => {
      },
      moveTo: () => {
      }, lineTo: () => {
      },
      stroke: () => {
      }, fill: () => {
      }, arc: () => {
      }, rect: () => {
      },
      createLinearGradient: () => ({
        addColorStop: () => {
        }
      }),
      createRadialGradient: () => ({
        addColorStop: () => {
        }
      }),
      canvas: this,
      save: () => {
      }, restore: () => {
      },
      scale: () => {
      }, translate: () => {
      }, rotate: () => {
      },
      setTransform: () => {
      }, transform: () => {
      }, resetTransform: () => {
      },
      drawImage: () => {
      },
      setLineDash: () => {
      },
      lineDashOffset: 0, shadowBlur: 0,
      globalAlpha: 1, strokeStyle: '#000', fillStyle: '#000',
      lineWidth: 1, font: '10px sans-serif',
      textAlign: 'start' as CanvasTextAlign, textBaseline: 'alphabetic' as CanvasTextBaseline,
    } as any;
  };
}

// Suppress noisy Chart.js/console warnings in jsdom
const originalError = console.error;
console.error = (...args: any[]) => {
  const msg = args[0]?.toString?.() ?? '';
  if (msg.includes('chart') || msg.includes('Chart') || msg.includes('getContext')
    || msg.includes('Not implemented') || msg.includes('ownerDocument')) {
    return;
  }
  originalError.apply(console, args);
};

// TestBed.initTestEnvironment is handled by the Angular builder (setupFiles)
