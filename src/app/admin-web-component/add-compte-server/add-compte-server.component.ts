import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { CompteServer } from 'src/app/data/data';
import { CompteServerService } from "../../service/compte-server.service";

import { DatePickerModule } from 'primeng/datepicker';
import { ToastrService } from 'ngx-toastr';
import { catchError } from "rxjs/operators";
import { Router } from "@angular/router";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';


// PrimeNG DatePicker replaces bsDatepicker

@Component({
    selector: 'app-add-compte-server',
    standalone: true,
    templateUrl: './add-compte-server.component.html',
    imports: [ReactiveFormsModule, DatePickerModule, TranslateModule, PageHeaderComponent]
})
export class AddCompteServerComponent {

  serverForm!: FormGroup;
  @ViewChild('progressModal') progressModal!: ElementRef<HTMLDialogElement>;
  public loading = false;
  mode: boolean = false;
  messageError: string = "";
  isExistPseudo: boolean = false;
  isExistLogin: boolean = false;
  public date: Date = new Date();
  notifications: number = 0;

  get numberBoitier(): number {
    return this.serverForm.get('numberBoitier')?.value || 0;
  }

  private readonly compteServerService = inject(CompteServerService);

  // Removed BsLocaleService as PrimeNG handles its own localization
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);

  constructor() {
    this.initForm();
  }

  initForm() {
    this.serverForm = this.fb.group({
      pseudo: ['', Validators.required],
      login: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmationPassword: ['', Validators.required],
      date_Expiration: [new Date(), Validators.required],
      numberBoitier: [0, [Validators.required, Validators.min(0)]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmationPassword')?.value
      ? null : { 'mismatch': true };
  }



  addCompteServer() {
    if (this.serverForm.invalid) {
      this.toastr.warning(
        this.translate.instant('WEB_ACCOUNTS.FILL_REQUIRED'), 
        this.translate.instant('COMMON.WARNING')
      );
      return;
    }

    if (this.progressModal) {
      this.progressModal.nativeElement.showModal();
    }

    this.loading = true;
    const formValue = this.serverForm.value;
    const compteServer: CompteServer = {
      ...formValue,
      date_Expiration: (formValue.date_Expiration as Date).getTime()
    };
    const numberBoitier = formValue.numberBoitier;

    this.compteServerService.createServerComptewithBoitier(compteServer, numberBoitier)
      .pipe(
        catchError(error => {
          this.mode = true;
          this.messageError = error.error?.message || this.translate.instant('COMMON.AN_ERROR_OCCURRED');
          this.loading = false;
          this.toastr.error(
            this.translate.instant('SERVER_ACCOUNTS.ADD_ERROR'), 
            this.translate.instant('COMMON.ERROR')
          );
          throw error;
        })
      )
      .subscribe({
        next: () => {
          this.mode = false;
          this.loading = false;
          this.toastr.success(
            this.translate.instant('SERVER_ACCOUNTS.UPDATE_SUCCESS'), 
            this.translate.instant('COMMON.SUCCESS')
          );
          this.router.navigate(['/adminWeb/listWebs']);
        }
      });
  }

  onKeyPseudo() {
    const pseudo = this.serverForm.get('pseudo')?.value;
    if (!pseudo) return;
    this.compteServerService.isExistPseudo(pseudo).subscribe(res => {
      this.isExistPseudo = res?.data !== undefined ? res.data : res;
    });
  }

  onKeyLogin() {
    const login = this.serverForm.get('login')?.value;
    if (!login) return;
    this.compteServerService.isExistLogin(login).subscribe(res => {
      this.isExistLogin = res?.data !== undefined ? res.data : res;
    });
  }

  reinitialisation() {
    this.serverForm.patchValue({ numberBoitier: 0 });
    if (this.progressModal) {
      this.progressModal.nativeElement.close();
    }
  }
}



