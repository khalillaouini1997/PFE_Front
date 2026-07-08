import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KeyboardFocusDirective } from './keyboard-focus.directive';

@Component({
  template: `<input appKeyboardFocus [focusOnMount]="autoFocus" [focusOnKey]="keyTrigger" />`,
  imports: [KeyboardFocusDirective],
  standalone: true,
})
class TestHostComponent {
  autoFocus = false;
  keyTrigger: string | null = null;
}

describe('KeyboardFocusDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
  });

  it('should create an instance', () => {
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input).toBeTruthy();
  });

  it('should focus element on mount when focusOnMount is true', () => {
    component.autoFocus = true;
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(document.activeElement).toBe(input);
  });

  it('should not focus element on mount when focusOnMount is false', () => {
    component.autoFocus = false;
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(document.activeElement).not.toBe(input);
  });

  it('should focus element on matching keydown', () => {
    component.keyTrigger = '/';
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const event = new KeyboardEvent('keydown', { key: '/', bubbles: true });
    window.dispatchEvent(event);

    expect(document.activeElement).toBe(input);
  });

  it('should not focus element on non-matching keydown', () => {
    component.keyTrigger = '/';
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true });
    window.dispatchEvent(event);

    expect(document.activeElement).not.toBe(input);
  });

  it('should not focus when focusOnKey is null', () => {
    component.keyTrigger = null;
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const event = new KeyboardEvent('keydown', { key: '/', bubbles: true });
    window.dispatchEvent(event);

    expect(document.activeElement).not.toBe(input);
  });
});
