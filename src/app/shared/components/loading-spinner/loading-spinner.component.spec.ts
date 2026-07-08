import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSpinnerComponent } from './loading-spinner.component';
import { By } from '@angular/platform-browser';

describe('LoadingSpinnerComponent', () => {
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSpinnerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders with default inputs', () => {
    expect(component.isLoading()).toBeFalsy();
    expect(component.size()).toBe('medium');
  });

  it('shows spinner when isLoading is true', () => {
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();
    const spinner = fixture.debugElement.query(By.css('.spinner'));
    expect(spinner).toBeTruthy();
  });

  it('applies correct size class', () => {
    fixture.componentRef.setInput('isLoading', true);
    fixture.componentRef.setInput('size', 'small');
    fixture.detectChanges();
    const spinner = fixture.debugElement.query(By.css('.spinner'));
    expect(spinner.nativeElement.classList.contains('size-small')).toBeTruthy();
  });

  it('shows overlay when overlay is true', () => {
    fixture.componentRef.setInput('isLoading', true);
    fixture.componentRef.setInput('overlay', true);
    fixture.detectChanges();
    const overlay = fixture.debugElement.query(By.css('.loading-overlay'));
    expect(overlay).toBeTruthy();
  });

  it('shows inline when overlay is false', () => {
    fixture.componentRef.setInput('isLoading', true);
    fixture.componentRef.setInput('overlay', false);
    fixture.detectChanges();
    const inline = fixture.debugElement.query(By.css('.loading-spinner-inline'));
    expect(inline).toBeTruthy();
  });

  it('displays message', () => {
    fixture.componentRef.setInput('isLoading', true);
    fixture.componentRef.setInput('message', 'Please wait');
    fixture.detectChanges();
    const message = fixture.debugElement.query(By.css('.loading-message'));
    expect(message.nativeElement.textContent).toContain('Please wait');
  });
});
