import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ThemeToggleComponent } from './theme-toggle.component';
import { ThemeService } from '../../../service/theme.service';

describe('ThemeToggleComponent', () => {
  let component: ThemeToggleComponent;
  let fixture: ComponentFixture<ThemeToggleComponent>;
  let themeServiceMock: { toggleTheme: ReturnType<typeof vi.fn>; isDarkMode: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    themeServiceMock = {
      toggleTheme: vi.fn(),
      isDarkMode: vi.fn().mockReturnValue(false),
    };

    await TestBed.configureTestingModule({
      imports: [ThemeToggleComponent],
      providers: [
        { provide: ThemeService, useValue: themeServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render toggle button', () => {
    const button = fixture.nativeElement.querySelector('button.theme-toggle-btn');
    expect(button).toBeTruthy();
  });

  it('should call themeService.toggleTheme on click', () => {
    const button = fixture.nativeElement.querySelector('button.theme-toggle-btn');
    button.click();
    expect(themeServiceMock.toggleTheme).toHaveBeenCalledTimes(1);
  });

  it('should display sun icon when dark mode is true', () => {
    themeServiceMock.isDarkMode.mockReturnValue(true);
    fixture.detectChanges();

    const sunIcon = fixture.nativeElement.querySelector('.sun-icon');
    const moonIcon = fixture.nativeElement.querySelector('.moon-icon');
    expect(sunIcon).toBeTruthy();
    expect(moonIcon).toBeNull();
  });

  it('should display moon icon when dark mode is false', () => {
    themeServiceMock.isDarkMode.mockReturnValue(false);
    fixture.detectChanges();

    const sunIcon = fixture.nativeElement.querySelector('.sun-icon');
    const moonIcon = fixture.nativeElement.querySelector('.moon-icon');
    expect(moonIcon).toBeTruthy();
    expect(sunIcon).toBeNull();
  });

  it('should have correct aria-label for light mode', () => {
    themeServiceMock.isDarkMode.mockReturnValue(false);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button.theme-toggle-btn');
    expect(button.getAttribute('aria-label')).toBe('Switch to dark mode');
  });

  it('should have correct aria-label for dark mode', () => {
    themeServiceMock.isDarkMode.mockReturnValue(true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button.theme-toggle-btn');
    expect(button.getAttribute('aria-label')).toBe('Switch to light mode');
  });
});
