import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {provideRouter} from '@angular/router';
import {importProvidersFrom} from '@angular/core';
import {ToastrModule} from 'ngx-toastr';
import {TranslateModule} from '@ngx-translate/core';
import {vi} from 'vitest';

import {AdminWebComponentComponent} from './admin-web-component.component';

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false, media: query, onchange: null,
      addListener: () => {
      }, removeListener: () => {
      },
      addEventListener: () => {
      }, removeEventListener: () => {
      },
      dispatchEvent: () => false,
    })),
  });
}

describe('AdminWebComponentComponent', () => {
  let component: AdminWebComponentComponent;
  let fixture: ComponentFixture<AdminWebComponentComponent>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideRouter([]),
        importProvidersFrom(ToastrModule.forRoot())
      ],
      imports: [TranslateModule.forRoot(), AdminWebComponentComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminWebComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle sidebar', () => {
    expect(component.isSidebarCollapsed).toBe(false);
    component.onSidebarToggle(true);
    expect(component.isSidebarCollapsed).toBe(true);
    component.onSidebarToggle(false);
    expect(component.isSidebarCollapsed).toBe(false);
  });
});
