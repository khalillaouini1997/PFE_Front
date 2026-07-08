import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';
import { By } from '@angular/platform-browser';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders with default variant/size', () => {
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.classList.contains('primary')).toBeTruthy();
    expect(button.nativeElement.classList.contains('size-md')).toBeTruthy();
  });

  it('applies correct CSS classes for variant', () => {
    fixture.componentRef.setInput('variant', 'secondary');
    fixture.detectChanges();
    let button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.classList.contains('secondary')).toBeTruthy();

    fixture.componentRef.setInput('variant', 'tertiary');
    fixture.detectChanges();
    button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.classList.contains('tertiary')).toBeTruthy();

    fixture.componentRef.setInput('variant', 'danger');
    fixture.detectChanges();
    button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.classList.contains('danger')).toBeTruthy();
  });

  it('applies correct CSS classes for size', () => {
    fixture.componentRef.setInput('size', 'sm');
    fixture.detectChanges();
    let button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.classList.contains('size-sm')).toBeTruthy();

    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.classList.contains('size-lg')).toBeTruthy();
  });

  it('applies full-width class when fullWidth is true', () => {
    fixture.componentRef.setInput('fullWidth', true);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.classList.contains('full-width')).toBeTruthy();
  });

  it('disables button when disabled input is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.disabled).toBeTruthy();
  });

  it('disables button when loading is true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.disabled).toBeTruthy();
  });

  it('shows spinner when loading is true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const spinner = fixture.debugElement.query(By.css('.spinner'));
    expect(spinner).toBeTruthy();
  });

  it('emits clicked output on button click', () => {
    const spy = vi.spyOn(component.clicked, 'emit');
    const button = fixture.debugElement.query(By.css('button'));
    button.triggerEventHandler('click', null);
    expect(spy).toHaveBeenCalled();
  });

  it('sets button type attribute', () => {
    fixture.componentRef.setInput('type', 'submit');
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.type).toBe('submit');
  });
});
