import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  template: `
    <form class="d-flex align-items-center" [formGroup]="form" (ngSubmit)="onSearch()">
      <div class="input-group shadow-sm search-container-premium">
        <input type="text" class="form-control border-0 px-3 search-input-premium bg-white bg-opacity-10 text-white"
          formControlName="keyWord" placeholder="{{ placeholder() | translate }}"
          title="{{ placeholder() | translate }}">
        <button class="btn btn-glass border-0" type="submit" title="{{ 'COMMON.SEARCH' | translate }}">
          <i class="fa fa-search"></i>
        </button>
      </div>
    </form>
  `
})
export class SearchInputComponent {
  placeholder = input<string>('COMMON.SEARCH');
  search = output<string>();

  readonly form: FormGroup;

  constructor() {
    const fb = inject(FormBuilder);
    this.form = fb.group({ keyWord: [''] });
  }

  onSearch() {
    this.search.emit(this.form.get('keyWord')?.value || '');
  }
}
