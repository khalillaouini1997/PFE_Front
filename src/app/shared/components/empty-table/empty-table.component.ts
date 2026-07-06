import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-empty-table',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <ng-template pTemplate="emptymessage">
      <tr>
        <td [attr.colspan]="colspan()" class="text-center py-5 text-secondary">
          <i class="fa {{ icon() }} fa-3x opacity-25 mb-2"></i>
          <p>{{ messageKey() | translate }}</p>
        </td>
      </tr>
    </ng-template>
  `
})
export class EmptyTableComponent {
  colspan = input<number>(1);
  icon = input<string>('fa-folder-open-o');
  messageKey = input.required<string>();
}
