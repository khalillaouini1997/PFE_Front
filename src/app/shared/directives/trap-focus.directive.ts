import { Directive, ElementRef, HostListener, input } from '@angular/core';

@Directive({
  selector: '[appTrapFocus]',
  standalone: true
})
export class TrapFocusDirective {
  enabled = input<boolean>(true);

  constructor(private el: ElementRef<HTMLElement>) {}

  @HostListener('keydown.tab', ['$event'])
  onTab(event: Event) {
    if (!this.enabled()) return;

    const keyboardEvent = event as KeyboardEvent;
    const focusableElements = this.getFocusableElements();
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (keyboardEvent.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  private getFocusableElements(): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]'
    ];

    return Array.from(
      this.el.nativeElement.querySelectorAll(focusableSelectors.join(','))
    ).filter(el => this.isVisible(el as HTMLElement)) as HTMLElement[];
  }

  private isVisible(element: HTMLElement): boolean {
    return element.offsetWidth > 0 && element.offsetHeight > 0;
  }
}
