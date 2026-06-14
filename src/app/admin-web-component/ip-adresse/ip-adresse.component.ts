import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { IpAddress, createIpAddress } from 'src/app/data/data';
import { IpAddressService } from 'src/app/service/ip-address.service';
import { catchError } from "rxjs/operators";
import { of } from "rxjs";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-ip-adresse',
  standalone: true,
  templateUrl: './ip-adresse.component.html',
  styleUrls: ['./ip-adresse.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TableModule, TranslateModule]
})
export class IpAdresseComponent implements OnInit {

  ipAddressSelected: IpAddress = createIpAddress();
  ips: IpAddress[] = [];
  public bigTotalItems: number = 0;
  public bigCurrentPage: number = 1;
  itemsPerPage = 15;
  typeConnection: { type: string; }[] = [];
  public maxSize: number = 5;

  searchForm!: FormGroup;
  updateIpForm!: FormGroup;
  @ViewChild('updateModal') updateModal!: ElementRef<HTMLDialogElement>;

  private readonly ipAddressService = inject(IpAddressService);
  private readonly toastr = inject(ToastrService);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);

  ngOnInit() {
    this.initForms();
    this.getAllIpAddresse(this.searchForm.get('keyWord')?.value || "", this.bigCurrentPage - 1, this.itemsPerPage);
    this.typeConnection = this.ipAddressService.typeConnection;
  }

  initForms() {
    this.searchForm = this.fb.group({
      keyWord: ['']
    });

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
        this.bigTotalItems = responseData?.page?.totalElements || responseData?.totalElements || 0;
      }
    });
  }

  searchIpAddress() {
    this.bigCurrentPage = 1;
    this.getAllIpAddresse(this.searchForm.get('keyWord')?.value, this.bigCurrentPage - 1, this.itemsPerPage);
  }

  deleteIpAddress(id: number) {
    const res = confirm(this.translate.instant('WEB_ACCOUNTS.DELETE_CONFIRM'));
    if (res) {
      this.ipAddressService.deleteIpAddress(id)
        .pipe(
          catchError(error => {
            return of('Failed to delete IP address: ' + error.message);
          })
        )
        .subscribe({
          next: () => {
            this.toastr.success(
              this.translate.instant('WEB_ACCOUNTS.DELETE_SUCCESS'), 
              this.translate.instant('COMMON.SUCCESS')
            );
            this.getAllIpAddresse(this.searchForm.get('keyWord')?.value, this.bigCurrentPage - 1, this.itemsPerPage);
          },
          error: (error) => {
            this.toastr.error(this.translate.instant('COMMON.ERROR'), this.translate.instant('COMMON.ERROR'));
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
      this.ipAddressService.updateIpAddress(updatedIp.idIpAdresse, updatedIp)
        .subscribe({
          next: () => {
            this.toastr.success(
              this.translate.instant('IP_ADDRESS.UPDATE_TITLE') + ' ' + this.translate.instant('COMMON.SUCCESS'), 
              this.translate.instant('COMMON.SUCCESS')
            );
            this.closeUpdateModal();
            this.getAllIpAddresse(this.searchForm.get('keyWord')?.value, this.bigCurrentPage - 1, this.itemsPerPage);
          }
        });
    }
  }

  public pageChanged(event: any): void {
    if (event.first !== undefined && event.rows !== undefined) {
      this.bigCurrentPage = (event.first / event.rows) + 1;
      this.itemsPerPage = event.rows;
      this.getAllIpAddresse(this.searchForm.get('keyWord')?.value, this.bigCurrentPage - 1, this.itemsPerPage);
    }
  }
}
