import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { getPlatform, destroyPlatform } from '@angular/core';

// Ensure exactly one platform is initialized
if (getPlatform()) {
  destroyPlatform();
}

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
  { teardown: { destroyAfterEach: true } } // Changed to true for better isolation
);
