import { Directive, ElementRef, HostListener, input } from '@angular/core';

@Directive({
  selector: '[appKeyboardFocus]',
  standalone: true
})
export class KeyboardFocusDirective {
  focusOnMount = input<boolean>(false);
  focusOnKey = input<string | null>(null);
  
  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit() {
    if (this.focusOnMount()) {
      this.focus();
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.focusOnKey() && event.key === this.focusOnKey()) {
      event.preventDefault();
      this.focus();
    }
  }

  private focus() {
    this.el.nativeElement.focus();
  }
}
