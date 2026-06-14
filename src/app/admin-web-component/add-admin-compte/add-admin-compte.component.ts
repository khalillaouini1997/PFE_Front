import { Component, inject } from '@angular/core';

import { AdministratorCompte } from 'src/app/data/data';
import { AdminAccountService } from 'src/app/service/admin-account.service';

import { catchError } from "rxjs/operators";
import { of, tap } from "rxjs";
import { ToastrService } from "ngx-toastr";
import { NOTIFICATION_SUBQUERIES } from '../../shared/constants';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';


@Component({
    selector: 'app-add-admin-compte',
    standalone: true,
    templateUrl: './add-admin-compte.component.html',
    styleUrls: ['./add-admin-compte.component.css'],
    imports: [ReactiveFormsModule, TranslateModule]
})
export class AddAdminCompteComponent {

  adminForm!: FormGroup;
  roles = ['GLOBALADMINDESC', 'WEBADMIN', 'AGENT'];
  notifSubs = NOTIFICATION_SUBQUERIES;
  messageError: string = "";
  mode: boolean = false;


  private readonly adminAccountService = inject(AdminAccountService);

  private readonly toastr = inject(ToastrService);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);

  constructor() {
    this.initForm();
  }

  initForm() {
    this.adminForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      role: ['WEBADMIN'],
      idTraccar: [0],
      useFcm: [false],
      fcmPrefix: [''],
      mailSupport: [''],
      deviceCostByDay: [0],
      accountFreePerMonth: [0],
      transctionFee: [0]
    });
  }



  addAdminCompte() {
    if (this.adminForm.invalid) {
      this.toastr.warning(
        this.translate.instant('WEB_ACCOUNTS.FILL_REQUIRED'), 
        this.translate.instant('COMMON.WARNING')
      );
      return;
    }

    const payload: AdministratorCompte = this.adminForm.value;
    this.adminAccountService.addAdminCompte(payload)
      .pipe(
        tap(() => {
          this.toastr.success(
            this.translate.instant('ADMIN_ACCOUNTS.ADD_SUCCESS'), 
            this.translate.instant('COMMON.SUCCESS')
          );
          this.adminForm.reset({ role: 'WEBADMIN', idTraccar: 0, useFcm: false });
        }),
        catchError(error => {
          this.toastr.error(
            this.translate.instant('ADMIN_ACCOUNTS.ADD_ERROR'), 
            this.translate.instant('COMMON.ERROR')
          );
          return of(null);
        })
      )
      .subscribe();
  }
}
