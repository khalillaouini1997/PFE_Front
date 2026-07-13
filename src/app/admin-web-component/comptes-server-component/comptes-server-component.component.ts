import {ChangeDetectorRef, Component, ElementRef, inject, OnInit, ViewChild} from '@angular/core';
import {saveAs as importedSaveAs} from 'file-saver';
import {ToastrService} from 'ngx-toastr';
import {CompteServer, IpAddress} from 'src/app/data/data';
import {CompteServerService} from "../../service/compte-server.service";
import {IpAddressService} from "../../service/ip-address.service";
import {AuthService} from '../../service/auth.service';
import {createPaginationState, pageChanged} from '../../shared/components/pagination-base';
import {withToast} from '../../utils/toast.helpers';

import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {DatePickerModule} from 'primeng/datepicker';
import {TranslateModule, TranslateService} from '@ngx-translate/core';

import {TableModule} from 'primeng/table';
import {PaginatorModule} from 'primeng/paginator';
import {PageHeaderComponent} from '../../shared/components/page-header/page-header.component';
import {SearchInputComponent} from '../../shared/components/search-input/search-input.component';
import {EmptyTableComponent} from '../../shared/components/empty-table/empty-table.component';

@Component({
  selector: 'app-comptes-server-component',
  standalone: true,
  templateUrl: './comptes-server-component.component.html',
  styleUrls: ['./comptes-server-component.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, TableModule, PaginatorModule, DatePickerModule, TranslateModule, PageHeaderComponent, SearchInputComponent, EmptyTableComponent]
})
export class ComptesServerComponentComponent implements OnInit {
  @ViewChild('updateModal') updateModal!: ElementRef<HTMLDialogElement>;
  keyWord: string = "";
  pagination = createPaginationState();
  comptesServer: CompteServer[] = [];
  loading: boolean = false;
  dt: Date = new Date();
  mode: boolean = false;
  messageError: string = "";
  ips: IpAddress[] = [];
  updateServerForm!: FormGroup;
  private readonly cdr = inject(ChangeDetectorRef);
  private loadingInProgress: boolean = false;
  private currentKeyWord: string = '';
  private readonly toastr = inject(ToastrService);
  private readonly route = inject(ActivatedRoute);
  private readonly compteServerService = inject(CompteServerService);
  private readonly ipAddressService = inject(IpAddressService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);

  canDelete(): boolean {
    return this.authService.hasRole('GLOBALADMINDESC');
  }

  ngOnInit() {
    this.initForms();
  }

  initForms() {
    this.updateServerForm = this.fb.group({
      idCompteClientServer: [null],
      pseudo: ['', Validators.required],
      login: ['', Validators.required],
      password: ['', Validators.required],
      idIpAdresse: [null, Validators.required]
    });

    this.ipAddressService.getAllIpAddresses('', 0, 100).subscribe((res: any) => {
      const responseData = res?.data || res;
      this.ips = responseData?.content || (Array.isArray(responseData) ? responseData : []);
      this.cdr.detectChanges();
    });
    this.loadComptesServer();
  }

  loadComptesServer(event?: any) {
    if (this.loadingInProgress) return;
    this.loadingInProgress = true;
    this.loading = true;
    this.comptesServer = [];
    this.cdr.detectChanges();

    let page = this.pagination.bigCurrentPage - 1;
    let size = this.pagination.itemsPerPage;

    if (event) {
      page = event.first ? Math.floor(event.first / event.rows) : 0;
      size = event.rows || this.pagination.itemsPerPage;
    }

    const keyWord = this.currentKeyWord;

    this.compteServerService.getAllServerAccount(keyWord, page, size).subscribe({
      next: (_comptesServer: any) => {
        const responseData = _comptesServer?.data || _comptesServer;
        const content = responseData?.content || responseData || [];
        this.comptesServer = Array.isArray(content) ? content : [];
        const now = Date.now();
        this.comptesServer.forEach(s => {
          s.expired = now >= s.date_Expiration;
          s.during = !s.expired;
        });
        this.pagination.bigTotalItems = responseData?.page?.totalElements || responseData?.totalElements || 0;
        this.loading = false;
        this.loadingInProgress = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.loadingInProgress = false;
        this.cdr.detectChanges();
      }
    });
  }

  onPageChanged(event: any): void {
    pageChanged(event, this.pagination);
    this.loadingInProgress = false;
    this.loadComptesServer();
  }

  searchAccount(keyWord: string = '') {
    this.currentKeyWord = keyWord;
    this.pagination.bigCurrentPage = 1;
    this.loadingInProgress = false;
    this.loadComptesServer();
  }

  onExport() {
    if (this.comptesServer.length <= 0) return;

    this.compteServerService.ExportListComptesServer(this.comptesServer)
      .subscribe(blob => {
        importedSaveAs(blob, this.translate.instant('SERVER_ACCOUNTS.REPORT_FILENAME'));
      });
  }

  deleteCompteServer() {
    const selectedId = this.updateServerForm.get('idCompteClientServer')?.value;
    if (selectedId && confirm(this.translate.instant('WEB_ACCOUNTS.DELETE_CONFIRM'))) {
      withToast(this.compteServerService.deleteCompteServer(selectedId), this.toastr, this.translate, 'SERVER_ACCOUNTS.DELETE_SUCCESS')
        .subscribe({
          next: () => {
            this.comptesServer = this.comptesServer.filter(x => x.idCompteClientServer !== selectedId);
          },
          error: () => {
          }
        });
    }
  }

  updateCompteServer() {
    const updatedCompte = {...this.updateServerForm.value, date_Expiration: this.dt.getTime()};
    withToast(this.compteServerService.updateServerCompte(updatedCompte.idCompteClientServer, updatedCompte), this.toastr, this.translate, 'SERVER_ACCOUNTS.UPDATE_SUCCESS')
      .subscribe({
        next: (_compteUp: any) => {
          this.mode = false;
          const now = Date.now();
          _compteUp.expired = now >= _compteUp.date_Expiration;
          _compteUp.during = !_compteUp.expired;

          const index = this.comptesServer.findIndex(x => x.idCompteClientServer === _compteUp.idCompteClientServer);
          if (index !== -1) {
            this.comptesServer[index] = _compteUp;
          }
          this.closeUpdateModal();
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.mode = true;
          this.messageError = error.error?.message || this.translate.instant('COMMON.AN_ERROR_OCCURRED');
          this.cdr.detectChanges();
        }
      });
  }

  onSelect(compteServer: CompteServer) {
    this.updateServerForm.patchValue(compteServer);
    this.dt = new Date(compteServer.date_Expiration);
    if (this.updateModal) {
      this.updateModal.nativeElement.showModal();
    }
  }

  closeUpdateModal() {
    if (this.updateModal) {
      this.updateModal.nativeElement.close();
    }
  }
}
