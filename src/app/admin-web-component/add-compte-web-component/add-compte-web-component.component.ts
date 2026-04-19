import { Router } from '@angular/router';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CompteServer, CompteWeb, IpAddress } from 'src/app/data/data';
import { WebAccountService } from "../../service/web-account.service";
import { AuthService } from "../../service/auth.service";
import { CompteServerService } from "../../service/compte-server.service";
import { IpAddressService } from "../../service/ip-address.service";
import { ToastrService } from "ngx-toastr";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { TranslateModule, TranslateService } from '@ngx-translate/core';


@Component({
    selector: 'app-add-compte-web-component',
    standalone: true,
    templateUrl: './add-compte-web-component.component.html',
    styleUrls: ['./add-compte-web-component.component.css'],
    imports: [ReactiveFormsModule, DatePickerModule, TranslateModule]
})
export class AddCompteWebComponentComponent implements OnInit {

  webForm!: FormGroup;
  serverAccounts = signal<CompteServer[]>([]);
  codesPays = signal<any[]>([]);
  ipAddresses = signal<IpAddress[]>([]);
  regions = ['Tunis', 'Sfax', 'Sousse'];
  notifSubs = ['date_sub(NOW(), INTERVAL 6 hour)', 'date_sub(NOW(), INTERVAL 1 DAY)', 'date_sub(NOW(), INTERVAL 2 DAY)'];
  checked = signal<boolean>(false);


  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly webAccountService = inject(WebAccountService);
  private readonly authService = inject(AuthService);
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
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/error']);
      return;
    }

    this.compteServerService.getAllServerAccountForForm().subscribe(res => {
      this.serverAccounts.set(res.content);
    });

    this.codesPays.set(this.webAccountService.codesPays);
    this.ipAddressService.getAllIps().subscribe(res => {
      this.ipAddresses.set(res);
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


    this.webAccountService.addCompteWeb(compteWeb).subscribe({
      next: (_compteWeb) => {
        this.webAccountService.associateCompteWebToCompteServer(_compteWeb.idCompteClientWeb, idCompteServer).subscribe();
        this.toastr.success(
          this.translate.instant('WEB_ACCOUNTS.ADD_SUCCESS'), 
          this.translate.instant('COMMON.SUCCESS')
        );
        this.router.navigate(['/adminWeb/listWebs']);
      },
      error: () => {
        this.toastr.error(
          this.translate.instant('WEB_ACCOUNTS.ADD_ERROR'), 
          this.translate.instant('COMMON.ERROR')
        );
      }
    });
  }
}
