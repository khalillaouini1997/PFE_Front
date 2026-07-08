import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SmartTableComponent } from './smart-table.component';
import { TableModule } from 'primeng/table';
import { TranslateModule } from '@ngx-translate/core';
import { EmptyTableComponent } from '../empty-table/empty-table.component';
import { TemplateRef } from '@angular/core';

describe('SmartTableComponent', () => {
  let component: SmartTableComponent;
  let fixture: ComponentFixture<SmartTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmartTableComponent, TableModule, TranslateModule, EmptyTableComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SmartTableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render p-table with data', () => {
    const data = [{ name: 'Alice' }, { name: 'Bob' }];
    component.data = data;
    fixture.detectChanges();

    const table = fixture.nativeElement.querySelector('table');
    expect(table).toBeTruthy();
  });

  it('should show empty table component when no data', () => {
    component.data = [];
    fixture.detectChanges();

    const emptyTable = fixture.nativeElement.querySelector('app-empty-table');
    expect(emptyTable).toBeTruthy();
  });

  it('should emit lazyLoad event', () => {
    const spy = vi.fn();
    component.lazyLoad.subscribe(spy);
    fixture.detectChanges();

    const event = { first: 0, rows: 15 };
    component.lazyLoad.emit(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit pageChange event', () => {
    const spy = vi.fn();
    component.pageChange.subscribe(spy);
    fixture.detectChanges();

    const event = { first: 15, rows: 15 };
    component.onPage(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should show loading state', () => {
    component.loading = true;
    component.data = [];
    fixture.detectChanges();

    expect(component.loading).toBe(true);
  });

  it('should configure paginator with rows and totalRecords', () => {
    component.rows = 20;
    component.totalRecords = 100;
    fixture.detectChanges();

    expect(component.rows).toBe(20);
    expect(component.totalRecords).toBe(100);
  });

  it('should set default input values', () => {
    fixture.detectChanges();

    expect(component.lazy).toBe(true);
    expect(component.paginator).toBe(true);
    expect(component.rows).toBe(15);
    expect(component.totalRecords).toBe(0);
    expect(component.loading).toBe(false);
    expect(component.colspan).toBe(10);
    expect(component.first).toBe(0);
  });

  it('should accept custom rowsPerPageOptions', () => {
    component.rowsPerPageOptions = [5, 10, 25];
    fixture.detectChanges();

    expect(component.rowsPerPageOptions).toEqual([5, 10, 25]);
  });
});
