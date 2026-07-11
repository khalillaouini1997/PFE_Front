import { Router } from '@angular/router';
import { Component, inject, signal, OnInit } from '@angular/core';
import { CompteWeb, IpAddress } from 'src/app/data/data';
import { WebAccountService } from "../../service/web-account.service";

import { CompteServerService } from "../../service/compte-server.service";
import { IpAddressService } from "../../service/ip-address.service";
import { ToastrService } from "ngx-toastr";
import { NOTIFICATION_SUBQUERIES } from '../../shared/constants';
import { withToast } from '../../utils/toast.helpers';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';


@Component({
    selector: 'app-add-compte-web-component',
    standalone: true,
    templateUrl: './add-compte-web-component.component.html',
    styleUrls: ['./add-compte-web-component.component.css'],
    imports: [ReactiveFormsModule, DatePickerModule, TranslateModule, PageHeaderComponent]
})
export class AddCompteWebComponentComponent implements OnInit {

  webForm!: FormGroup;
  serverAccounts = signal<any[]>([]);
  codesPays = signal<any[]>([]);
  ipAddresses = signal<IpAddress[]>([]);
  regions = ['Tunis', 'Sfax', 'Sousse'];
  notifSubs = NOTIFICATION_SUBQUERIES;
  checked = signal<boolean>(false);


  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly webAccountService = inject(WebAccountService);

  private readonly ipAddressService = inject(IpAddressService);
  private readonly compteServerService = inject(CompteServerService);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);

  constructor() {
    this.initForm();
  }

  initForm() {
    this.webForm = this.fb.group({
      login: ['', Validators.required],
      password: ['', Validators.required],
      code_pays: ['', Validators.required],
      date_expiration: [new Date(), Validators.required],
      idCompte: ['', Validators.required],
      ipAdresse: ['', Validators.required],
      firstname: [''],
      lastname: [''],
      email: ['', [Validators.email]],
      telephone: [''],
      area: ['Tunis'],
      notificationSubquery: ['date_sub(NOW(), INTERVAL 1 DAY)'],
      mobileNotif: [false],
      deviceFeeByDay: [0],
      accountFeeByMonth: [0],
      deviceFeePerMonth: [0],
      simCardFeePerMonth: [0]
    });
  }

  ngOnInit() {


    this.compteServerService.getAllServerAccountForForm().subscribe({
      next: (res: any) => {
        const responseData = res?.data || res;
        this.serverAccounts.set(Array.isArray(responseData) ? responseData : []);
      },
      error: (_err) => {
      }
    });

    this.codesPays.set(this.webAccountService.codesPays);
    this.ipAddressService.getAllIpAddresses('', 0, 100).subscribe(res => {
      const content = res?.content || res;
      this.ipAddresses.set(Array.isArray(content) ? content : []);
    });
  }


  addCompteWeb() {
    if (this.webForm.invalid) {
      this.toastr.warning(
        this.translate.instant('WEB_ACCOUNTS.FILL_REQUIRED'), 
        this.translate.instant('COMMON.WARNING')
      );
      return;
    }

    const formValue = this.webForm.value;
    const compteWeb: CompteWeb = {
      ...formValue,
      date_expiration: (formValue.date_expiration as Date).getTime()
    };

    const idCompteServer = formValue.idCompte;
    const selectedServer = this.serverAccounts().find(s => s.idCompteClientServer == idCompteServer);
    if (selectedServer) {
      compteWeb.compteClientServer = selectedServer;
    }


    withToast(this.webAccountService.addCompteWeb(compteWeb), this.toastr, this.translate, 'WEB_ACCOUNTS.ADD_SUCCESS')
      .subscribe({
        next: (_compteWeb) => {
          this.webAccountService.associateCompteWebToCompteServer(_compteWeb.idCompteClientWeb, idCompteServer).subscribe();
          this.router.navigate(['/adminWeb/listWebs']);
        },
        error: () => {}
      });
  }
}
