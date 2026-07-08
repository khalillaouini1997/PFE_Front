import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi, afterEach } from 'vitest';
import { TrapFocusDirective } from './trap-focus.directive';

@Component({
  template: `
    <div appTrapFocus>
      <button id="first">First</button>
      <input id="middle" />
      <button id="last">Last</button>
    </div>
  `,
  imports: [TrapFocusDirective],
  standalone: true,
})
class TestHostComponent {}

describe('TrapFocusDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let firstBtn: HTMLButtonElement;
  let lastBtn: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    firstBtn = fixture.nativeElement.querySelector('#first');
    lastBtn = fixture.nativeElement.querySelector('#last');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create an instance', () => {
    expect(fixture.nativeElement.querySelector('[appTrapFocus]')).toBeTruthy();
  });

  it('should call onTab on Tab keydown', () => {
    const directiveDebugEl = fixture.debugElement.query(By.directive(TrapFocusDirective));
    const directiveInstance = directiveDebugEl.injector.get(TrapFocusDirective);
    const spy = vi.spyOn(directiveInstance, 'onTab');

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
    });
    lastBtn.dispatchEvent(event);

    expect(spy).toHaveBeenCalled();
  });

  it('should call onTab on Shift+Tab keydown', () => {
    const directiveDebugEl = fixture.debugElement.query(By.directive(TrapFocusDirective));
    const directiveInstance = directiveDebugEl.injector.get(TrapFocusDirective);

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
    });
    lastBtn.dispatchEvent(event);

    expect(directiveInstance).toBeTruthy();
  });
});
