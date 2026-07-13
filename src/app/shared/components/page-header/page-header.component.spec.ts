import {ComponentFixture, TestBed} from '@angular/core/testing';
import {PageHeaderComponent} from './page-header.component';
import {TranslateModule} from '@ngx-translate/core';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';

@Component({
  template: `
    <app-page-header titleKey="TEST_TITLE" subtitleKey="TEST_SUBTITLE">
      <button>Test Button</button>
    </app-page-header>
  `,
  imports: [PageHeaderComponent]
})
class TestHostComponent {
}

describe('PageHeaderComponent', () => {
  let component: PageHeaderComponent;
  let fixture: ComponentFixture<PageHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeaderComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PageHeaderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('titleKey', 'TEST_TITLE');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders title', () => {
    const title = fixture.debugElement.query(By.css('h2'));
    expect(title).toBeTruthy();
  });

  it('renders subtitle when provided', () => {
    fixture.componentRef.setInput('subtitleKey', 'TEST_SUBTITLE');
    fixture.detectChanges();
    const subtitle = fixture.debugElement.query(By.css('p'));
    expect(subtitle).toBeTruthy();
  });

  it('projects content', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
    const button = hostFixture.debugElement.query(By.css('button'));
    expect(button).toBeTruthy();
    expect(button.nativeElement.textContent).toContain('Test Button');
  });
});
