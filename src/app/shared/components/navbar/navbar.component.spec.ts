import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let translateService: TranslateService;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), NavbarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should change language and persist it to localStorage', () => {
    localStorage.removeItem('language');
    const translateSpy = vi.spyOn(translateService, 'use');

    component.changeLanguage('en');

    expect(translateSpy).toHaveBeenCalledWith('en');
    expect(localStorage.getItem('language')).toBe('en');
  });

  it('should check if a language is currently active', () => {
    translateService.currentLang = 'fr';
    expect(component.isLang('fr')).toBe(true);
    expect(component.isLang('en')).toBe(false);
  });
});
