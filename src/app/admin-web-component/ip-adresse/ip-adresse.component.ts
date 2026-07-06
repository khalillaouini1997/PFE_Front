import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { IpAddress, createIpAddress } from 'src/app/data/data';
import { IpAddressService } from 'src/app/service/ip-address.service';
import { createPaginationState, pageChanged } from '../../shared/components/pagination-base';
import { catchError } from "rxjs/operators";
import { of } from "rxjs";
import { withToast } from '../../utils/toast.helpers';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';
import { EmptyTableComponent } from '../../shared/components/empty-table/empty-table.component';

@Component({
  selector: 'app-ip-adresse',
  standalone: true,
  templateUrl: './ip-adresse.component.html',
  styleUrls: ['./ip-adresse.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TableModule, TranslateModule, PageHeaderComponent, SearchInputComponent, EmptyTableComponent]
})
export class IpAdresseComponent implements OnInit {

  ipAddressSelected: IpAddress = createIpAddress();
  ips: IpAddress[] = [];
  pagination = createPaginationState({ itemsPerPage: 15 });
  typeConnection: { type: string; }[] = [];
  private currentKeyWord: string = '';

  updateIpForm!: FormGroup;
  @ViewChild('updateModal') updateModal!: ElementRef<HTMLDialogElement>;

  private readonly ipAddressService = inject(IpAddressService);
  private readonly toastr = inject(ToastrService);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);

  ngOnInit() {
    this.initForms();
    this.getAllIpAddresse('', this.pagination.bigCurrentPage - 1, this.pagination.itemsPerPage);
    this.typeConnection = this.ipAddressService.typeConnection;
  }

  initForms() {
    this.updateIpForm = this.fb.group({
      idIpAdresse: [null],
      label: ['', Validators.required],
      value: ['', Validators.required],
      jdbcUser: [''],
      jdbcPass: [''],
      url: [''],
      typeConnection: [''],
      dbName: ['']
    });
  }

  getAllIpAddresse(keyWord: string, page: number, size: number) {
    this.ipAddressService.getAllIpAddresses(keyWord, page, size).subscribe({
      next: (res: any) => {
        const responseData = res?.data || res;
        this.ips = responseData?.content || [];
        this.pagination.bigTotalItems = responseData?.page?.totalElements || responseData?.totalElements || 0;
      }
    });
  }

  searchIpAddress(keyWord: string = '') {
    this.currentKeyWord = keyWord;
    this.pagination.bigCurrentPage = 1;
    this.getAllIpAddresse(keyWord, this.pagination.bigCurrentPage - 1, this.pagination.itemsPerPage);
  }

  deleteIpAddress(id: number) {
    const res = confirm(this.translate.instant('WEB_ACCOUNTS.DELETE_CONFIRM'));
    if (res) {
      withToast(this.ipAddressService.deleteIpAddress(id), this.toastr, this.translate, 'WEB_ACCOUNTS.DELETE_SUCCESS')
        .pipe(
          catchError(error => {
            return of(null);
          })
        )
        .subscribe({
          next: () => {
            this.getAllIpAddresse(this.currentKeyWord, this.pagination.bigCurrentPage - 1, this.pagination.itemsPerPage);
          }
        });
    }
  }

  onSelect(IpAddres: IpAddress) {
    this.ipAddressSelected = IpAddres;
    this.updateIpForm.patchValue(IpAddres);
    if (this.updateModal) {
      this.updateModal.nativeElement.showModal();
    }
  }

  closeUpdateModal() {
    if (this.updateModal) {
      this.updateModal.nativeElement.close();
    }
  }

  updateIpAdress() {
    const updatedIp = this.updateIpForm.value;
    if (updatedIp.idIpAdresse !== null) {
      withToast(this.ipAddressService.updateIpAddress(updatedIp.idIpAdresse, updatedIp), this.toastr, this.translate, 'IP_ADDRESS.UPDATE_TITLE')
        .subscribe({
          next: () => {
            this.closeUpdateModal();
            this.getAllIpAddresse(this.currentKeyWord, this.pagination.bigCurrentPage - 1, this.pagination.itemsPerPage);
          }
        });
    }
  }

  onPageChanged(event: any): void {
    pageChanged(event, this.pagination);
    this.getAllIpAddresse(this.currentKeyWord, this.pagination.bigCurrentPage - 1, this.pagination.itemsPerPage);
  }
}
