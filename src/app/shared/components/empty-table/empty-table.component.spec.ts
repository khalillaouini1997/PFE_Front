import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyTableComponent } from './empty-table.component';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';

describe('EmptyTableComponent', () => {
  let component: EmptyTableComponent;
  let fixture: ComponentFixture<EmptyTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyTableComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('messageKey', 'NO_DATA');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders with default inputs', () => {
    expect(component.colspan()).toBe(1);
    expect(component.icon()).toBe('fa-folder-open-o');
  });

  it('has icon default value', () => {
    expect(component.icon()).toBe('fa-folder-open-o');
  });

  it('has colspan default value', () => {
    expect(component.colspan()).toBe(1);
  });

  it('should accept custom colspan', () => {
    fixture.componentRef.setInput('colspan', 5);
    expect(component.colspan()).toBe(5);
  });

  it('should accept custom icon', () => {
    fixture.componentRef.setInput('icon', 'fa-trash');
    expect(component.icon()).toBe('fa-trash');
  });

  it('should have messageKey required input', () => {
    expect(component.messageKey()).toBe('NO_DATA');
  });

  it('should accept different message keys', () => {
    fixture.componentRef.setInput('messageKey', 'EMPTY_LIST');
    expect(component.messageKey()).toBe('EMPTY_LIST');
  });
});
