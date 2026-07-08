import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { EmptyTableComponent } from '../empty-table/empty-table.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-smart-table',
  standalone: true,
  imports: [CommonModule, TableModule, EmptyTableComponent, TranslateModule],
  template: `
    <div class="premium-card p-0 overflow-hidden shadow-sm">
      <p-table
        [value]="data"
        [lazy]="lazy"
        (onLazyLoad)="lazyLoad.emit($event)"
        [paginator]="paginator"
        [rows]="rows"
        [totalRecords]="totalRecords"
        [rowsPerPageOptions]="rowsPerPageOptions"
        [loading]="loading"
        [reorderableColumns]="reorderable"
        [resizableColumns]="resizable"
        columnResizeMode="expand"
        styleClass="p-datatable-sm p-datatable-gridlines premium-table-custom"
        responsiveLayout="scroll"
        paginatorPosition="bottom"
        [first]="first"
        (onPage)="onPage($event)">

        <ng-template pTemplate="header">
          <ng-content select="[tableHeader]"></ng-content>
        </ng-template>

        <ng-template pTemplate="body" let-row>
          <ng-container *ngTemplateOutlet="rowTemplate; context: { $implicit: row }"></ng-container>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td [attr.colspan]="colspan">
              <app-empty-table [colspan]="colspan" [icon]="emptyIcon" [messageKey]="emptyMessageKey" />
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `
})
export class SmartTableComponent {
  @Input() data: any[] = [];
  @Input() lazy = true;
  @Input() paginator = true;
  @Input() rows = 15;
  @Input() totalRecords = 0;
  @Input() rowsPerPageOptions = [10, 15, 30, 50];
  @Input() loading = false;
  @Input() reorderable = true;
  @Input() resizable = true;
  @Input() colspan = 10;
  @Input() emptyIcon = 'fa-table';
  @Input() emptyMessageKey = 'COMMON.NO_DATA';
  @Input() first = 0;

  @Input() rowTemplate!: TemplateRef<any>;

  @Output() lazyLoad = new EventEmitter<TableLazyLoadEvent>();
  @Output() pageChange = new EventEmitter<TableLazyLoadEvent>();

  onPage(event: TableLazyLoadEvent) {
    this.pageChange.emit(event);
  }
}
