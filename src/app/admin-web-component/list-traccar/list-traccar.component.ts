import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit} from '@angular/core';
import {TraccarDto} from 'src/app/data/data';
import {TraccarService} from 'src/app/service/traccar.service';
import {TableModule} from 'primeng/table';
import {DialogModule} from 'primeng/dialog';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ConfirmationService} from 'primeng/api';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {EmptyTableComponent, PageHeaderComponent, SearchInputComponent} from '../../shared/components';
import {catchError} from 'rxjs/operators';
import {of} from 'rxjs';
import {withToast} from '../../utils/toast.helpers';

@Component({
  selector: 'app-list-traccar',
  standalone: true,
  templateUrl: './list-traccar.component.html',
  styleUrls: ['./list-traccar.component.css'],
  imports: [
    CommonModule,
    TableModule,
    DialogModule,
    ConfirmDialogModule,
    ReactiveFormsModule,
    TranslateModule,
    PageHeaderComponent,
    SearchInputComponent,
    EmptyTableComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService]
})
export class ListTraccarComponent implements OnInit, OnDestroy {

  traccarDtos: TraccarDto[] = [];
  loading: boolean = false;
  totalRecords: number = 0;
  showDialog: boolean = false;
  editMode: boolean = false;
  selectedDevice: TraccarDto | null = null;
  deviceForm!: FormGroup;
  saving: boolean = false;
  private readonly traccarService = inject(TraccarService);
  private readonly toastr = inject(ToastrService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly translate = inject(TranslateService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly fb = inject(FormBuilder);

  ngOnInit() {
    this.initForm();
    this.getLisTraccar();
  }

  initForm() {
    this.deviceForm = this.fb.group({
      name: ['', Validators.required],
      imei: ['', Validators.required],
      category: [''],
      phone: [''],
      model: [''],
      contact: ['']
    });
  }

  getLisTraccar(keyword: string = '') {
    this.loading = true;
    this.traccarService.getLisTraccar(keyword).subscribe({
      next: (traccarDto: any) => {
        const responseData = traccarDto?.data || traccarDto;
        const data = Array.isArray(responseData) ? responseData : (responseData?.content || []);
        if (!data || data.length === 0) {
          this.traccarDtos = [];
          this.totalRecords = 0;
          this.toastr.warning(this.translate.instant('TRACCAR.NO_CONFIGURED'), this.translate.instant('COMMON.WARNING'));
        } else {
          this.traccarDtos = data;
          this.totalRecords = data?.length || 0;
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.toastr.error(this.translate.instant('TRACCAR.LOAD_ERROR'), this.translate.instant('COMMON.ERROR'));
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  searchWebAccount(keyword: string = '') {
    this.getLisTraccar(keyword);
  }

  openAddDialog() {
    this.editMode = false;
    this.selectedDevice = null;
    this.deviceForm.reset({name: '', imei: '', category: '', phone: '', model: '', contact: ''});
    this.showDialog = true;
    this.cdr.markForCheck();
  }

  openEditDialog(device: TraccarDto) {
    this.editMode = true;
    this.selectedDevice = device;
    this.deviceForm.patchValue({
      name: device.name,
      imei: device.imei,
      category: device.category || '',
      phone: device.phone || '',
      model: device.model || '',
      contact: device.contact || ''
    });
    this.showDialog = true;
    this.cdr.markForCheck();
  }

  saveDevice() {
    if (this.deviceForm.invalid) {
      this.deviceForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const payload: TraccarDto = this.deviceForm.value;

    const operation = this.editMode
      ? this.traccarService.updateDevice(this.selectedDevice!.id, payload)
      : this.traccarService.createDevice(payload);

    const successKey = this.editMode ? 'TRACCAR.UPDATE_SUCCESS' : 'TRACCAR.CREATE_SUCCESS';

    withToast(operation, this.toastr, this.translate, successKey)
      .pipe(catchError(() => {
        this.saving = false;
        this.cdr.markForCheck();
        return of(null);
      }))
      .subscribe({
        next: (res) => {
          if (res !== null) {
            this.showDialog = false;
            this.getLisTraccar();
          }
          this.saving = false;
          this.cdr.markForCheck();
        }
      });
  }

  confirmDelete(device: TraccarDto) {
    this.confirmationService.confirm({
      message: this.translate.instant('TRACCAR.DELETE_CONFIRM'),
      header: this.translate.instant('TRACCAR.DELETE_DEVICE'),
      icon: 'fa fa-exclamation-triangle text-warning',
      acceptLabel: this.translate.instant('COMMON.YES'),
      rejectLabel: this.translate.instant('COMMON.NO'),
      accept: () => {
        this.deleteDevice(device.id);
      }
    });
  }

  deleteDevice(id: number) {
    withToast(
      this.traccarService.deleteDevice(id),
      this.toastr,
      this.translate,
      'TRACCAR.DELETE_SUCCESS'
    )
      .pipe(catchError(() => of(null)))
      .subscribe({
        next: (res) => {
          if (res !== null) {
            this.getLisTraccar();
          }
        }
      });
  }

  ngOnDestroy() {
    this.traccarDtos = [];
    this.totalRecords = 0;
  }
}
