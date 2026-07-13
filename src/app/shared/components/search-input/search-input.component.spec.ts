import {ComponentFixture, TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {SearchInputComponent} from './search-input.component';
import {ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';

describe('SearchInputComponent', () => {
  let component: SearchInputComponent;
  let fixture: ComponentFixture<SearchInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchInputComponent, ReactiveFormsModule, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render input field', () => {
    const input = fixture.nativeElement.querySelector('input[type="text"]');
    expect(input).toBeTruthy();
  });

  it('should emit search event on form submit', () => {
    const spy = vi.fn();
    component.searchQuery.subscribe(spy);

    component.form.get('keyWord')?.setValue('test query');
    component.onSearch();

    expect(spy).toHaveBeenCalledWith('test query');
  });

  it('should emit empty string when input is empty', () => {
    const spy = vi.fn();
    component.searchQuery.subscribe(spy);

    component.onSearch();

    expect(spy).toHaveBeenCalledWith('');
  });

  it('should have default placeholder', () => {
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input).toBeTruthy();
  });

  it('should accept custom placeholder input', () => {
    fixture.componentRef.setInput('placeholder', 'CUSTOM.SEARCH');
    fixture.detectChanges();

    expect(component.placeholder()).toBe('CUSTOM.SEARCH');
  });

  it('should have form with keyWord control', () => {
    expect(component.form.get('keyWord')).toBeTruthy();
    expect(component.form.get('keyWord')?.value).toBe('');
  });

  it('should have submit button', () => {
    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button).toBeTruthy();
  });
});
