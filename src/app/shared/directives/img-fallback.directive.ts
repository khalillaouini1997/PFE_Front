import { Directive, ElementRef, HostListener, input } from '@angular/core';

@Directive({
  selector: 'img[appImgFallback]',
  standalone: true
})
export class ImgFallbackDirective {
  fallbackSrc = input<string>('');
  fallbackIcon = input<string>('image');

  constructor(private el: ElementRef<HTMLImageElement>) {}

  @HostListener('error')
  onError() {
    const img = this.el.nativeElement;
    
    if (this.fallbackSrc()) {
      img.src = this.fallbackSrc();
    } else {
      // Replace with a placeholder icon
      img.style.display = 'none';
      
      const parent = img.parentElement;
      if (parent) {
        const placeholder = document.createElement('div');
        placeholder.className = 'img-fallback-placeholder';
        placeholder.innerHTML = `<i class="material-icons">${this.fallbackIcon()}</i>`;
        placeholder.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${img.width || 100}px;
          height: ${img.height || 100}px;
          background: var(--slate-100);
          border-radius: var(--radius-lg);
          color: var(--slate-400);
          font-size: 48px;
        `;
        parent.insertBefore(placeholder, img);
      }
    }
  }
}
