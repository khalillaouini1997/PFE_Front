import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonComponent } from './skeleton.component';
import { By } from '@angular/platform-browser';

describe('SkeletonComponent', () => {
  let component: SkeletonComponent;
  let fixture: ComponentFixture<SkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders skeleton placeholder', () => {
    const skeleton = fixture.debugElement.query(By.css('.skeleton'));
    expect(skeleton).toBeTruthy();
  });

  it('applies width/height styles', () => {
    fixture.componentRef.setInput('width', '200px');
    fixture.componentRef.setInput('height', 50);
    fixture.detectChanges();
    const skeleton = fixture.debugElement.query(By.css('.skeleton'));
    expect(skeleton.nativeElement.style.width).toBe('200px');
    expect(skeleton.nativeElement.style.height).toBe('50px');
  });

  it('renders multiple skeletons based on count', () => {
    fixture.componentRef.setInput('count', 3);
    fixture.detectChanges();
    const skeletons = fixture.debugElement.queryAll(By.css('.skeleton'));
    expect(skeletons.length).toBe(3);
  });
});
