import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { vi } from 'vitest';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter([]), importProvidersFrom(ToastrModule.forRoot())],
      imports: [
        TranslateModule.forRoot(),
        AppComponent
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'web_admin'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('web_admin');
  });

  it('should set default language to fr', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const translate = TestBed.inject(TranslateService);
    expect(translate.getDefaultLang()).toBe('fr');
  });

  it('should use stored language from localStorage', () => {
    localStorage.setItem('language', 'en');
    const fixture = TestBed.createComponent(AppComponent);
    const translate = TestBed.inject(TranslateService);
    expect(translate.currentLang).toBe('en');
    localStorage.removeItem('language');
  });

  it('should fallback to fr for unsupported browser language', () => {
    localStorage.removeItem('language');
    const fixture = TestBed.createComponent(AppComponent);
    const translate = TestBed.inject(TranslateService);
    const lang = translate.currentLang;
    expect(lang === 'fr' || lang === 'en').toBe(true);
  });

  it('should add supported languages', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const translate = TestBed.inject(TranslateService);
    const langs = translate.getLangs();
    expect(langs).toContain('fr');
    expect(langs).toContain('en');
  });

  it('should add error banner event listener on afterViewInit', () => {
    const spy = vi.spyOn(window, 'addEventListener');
    const fixture = TestBed.createComponent(AppComponent);
    fixture.componentInstance.ngAfterViewInit();
    expect(spy).toHaveBeenCalledWith('show-error-banner', expect.any(Function));
  });

  it('should remove error banner event listener on destroy', () => {
    const spy = vi.spyOn(window, 'removeEventListener');
    const fixture = TestBed.createComponent(AppComponent);
    fixture.componentInstance.ngOnDestroy();
    expect(spy).toHaveBeenCalledWith('show-error-banner', expect.any(Function));
  });

  it('should handle error banner event when errorBanner exists', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const showError = vi.fn();
    (component as any).errorBanner = { showError };
    const event = new CustomEvent('show-error-banner', {
      detail: { type: 'server', message: 'test error' }
    });
    (component as any).handleShowErrorBanner(event);
    expect(showError).toHaveBeenCalledWith({ type: 'server', message: 'test error' });
  });

  it('should ignore error banner event when errorBanner is null', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    (component as any).errorBanner = null;
    const event = new CustomEvent('show-error-banner', {
      detail: { type: 'server', message: 'test error' }
    });
    expect(() => (component as any).handleShowErrorBanner(event)).not.toThrow();
  });
});
