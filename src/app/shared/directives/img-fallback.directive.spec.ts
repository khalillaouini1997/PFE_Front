import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImgFallbackDirective } from './img-fallback.directive';

@Component({
  template: `<img appImgFallback [fallbackSrc]="fallbackSrc" [fallbackIcon]="fallbackIcon" src="broken.jpg" />`,
  imports: [ImgFallbackDirective],
  standalone: true,
})
class TestHostComponent {
  fallbackSrc = '';
  fallbackIcon = 'image';
}

describe('ImgFallbackDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    const img = fixture.nativeElement.querySelector('img');
    expect(img).toBeTruthy();
  });

  it('should set fallbackSrc on error when fallbackSrc is provided', () => {
    component.fallbackSrc = 'fallback.png';
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    img.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(img.src).toContain('fallback.png');
  });

  it('should hide img when no fallbackSrc', () => {
    component.fallbackSrc = '';
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    img.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(img.style.display).toBe('none');
  });

  it('should create placeholder with fallback icon when no fallbackSrc', () => {
    component.fallbackSrc = '';
    component.fallbackIcon = 'broken_image';
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    img.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    const placeholder = fixture.nativeElement.querySelector('.img-fallback-placeholder');
    expect(placeholder).toBeTruthy();
    expect(placeholder!.innerHTML).toContain('broken_image');
  });
});
