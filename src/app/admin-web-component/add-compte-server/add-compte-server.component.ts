import { Component, OnInit, inject } from '@angular/core';
import { CompteServer, CompteServerWithBoitier, IpAddress } from 'src/app/data/data';
import { CompteServerService } from "../../service/compte-server.service";
import { AuthService } from "../../service/auth.service";
import { IpAddressService } from "../../service/ip-address.service";
import { BsLocaleService, BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { defineLocale } from 'ngx-bootstrap/chronos';
import { frLocale } from 'ngx-bootstrap/locale';
import { ToastrService } from 'ngx-toastr';
import { catchError } from "rxjs/operators";
import { Router } from "@angular/router";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

defineLocale('fr', frLocale);

@Component({
    selector: 'app-add-compte-server',
    templateUrl: './add-compte-server.component.html',
    styleUrls: ['./add-compte-server.component.css'],
    imports: [ReactiveFormsModule, BsDatepickerModule, CommonModule]
})
export class AddCompteServerComponent implements OnInit {

  serverForm!: FormGroup;
  ipAddresses: IpAddress[] = [];
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
  private readonly ipAddressService = inject(IpAddressService);
  private readonly authService = inject(AuthService);
  private readonly localeService = inject(BsLocaleService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  constructor() {
    this.localeService.use('fr');
    this.initForm();
  }

  initForm() {
    this.serverForm = this.fb.group({
      pseudo: ['', Validators.required],
      login: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmationPassword: ['', Validators.required],
      ipAdresse: [''],
      date_Expiration: [new Date(), Validators.required],
      numberBoitier: [0, [Validators.required, Validators.min(0)]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmationPassword')?.value
      ? null : { 'mismatch': true };
  }

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/error']);
      return;
    }

    this.ipAddressService.getAllIps().subscribe(res => {
      this.ipAddresses = res;
    });
  }

  addCompteServer() {
    if (this.serverForm.invalid) {
      this.toastr.warning('Please fill all required fields correctly', 'Warning');
      return;
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
          this.messageError = error.error?.message || "An error occurred";
          this.loading = false;
          this.toastr.error('can not add account', 'Error!');
          throw error;
        })
      )
      .subscribe({
        next: () => {
          this.mode = false;
          this.loading = false;
          this.toastr.success('Server Account added', 'Success!');
          this.router.navigate(['/adminWeb/listWebs']);
        }
      });
  }

  onKeyPseudo() {
    const pseudo = this.serverForm.get('pseudo')?.value;
    if (!pseudo) return;
    this.compteServerService.isExistPseudo(pseudo).subscribe(res => {
      this.isExistPseudo = res;
    });
  }

  onKeyLogin() {
    const login = this.serverForm.get('login')?.value;
    if (!login) return;
    this.compteServerService.isExistLogin(login).subscribe(res => {
      this.isExistLogin = res;
    });
  }

  reinitialisation() {
    this.serverForm.patchValue({ numberBoitier: 0 });
  }
}



