import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AdministratorCompte } from 'src/app/data/data';
import { AdminAccountService } from 'src/app/service/admin-account.service';
import { AuthService } from 'src/app/service/auth.service';
import { catchError } from "rxjs/operators";
import { of, tap } from "rxjs";
import { ToastrService } from "ngx-toastr";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';


@Component({
    selector: 'app-add-admin-compte',
    standalone: true,
    templateUrl: './add-admin-compte.component.html',
    styleUrls: ['./add-admin-compte.component.css'],
    imports: [ReactiveFormsModule, TranslateModule]
})
export class AddAdminCompteComponent implements OnInit {

  adminForm!: FormGroup;
  roles = ['GLOBALADMIN', 'WEBADMIN', 'GLOBALADMINDESC', 'AGENT'];
  notifSubs = ['date_sub(NOW(), INTERVAL 6 hour)', 'date_sub(NOW(), INTERVAL 1 DAY)', 'date_sub(NOW(), INTERVAL 2 DAY)'];
  messageError: string = "";
  mode: boolean = false;

  private readonly router = inject(Router);
  private readonly adminAccountService = inject(AdminAccountService);
  private readonly authService = inject(AuthService);
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

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/error']);
    }
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
          console.error('Error adding admin compte:', error);
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
