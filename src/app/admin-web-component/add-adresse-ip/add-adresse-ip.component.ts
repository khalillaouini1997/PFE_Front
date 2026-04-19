import { Component, OnInit, inject } from '@angular/core';
import { IpAddressService } from "../../service/ip-address.service";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-add-adresse-ip',
    standalone: true,
    templateUrl: './add-adresse-ip.component.html',
    styleUrls: ['./add-adresse-ip.component.css'],
    imports: [ReactiveFormsModule, TranslateModule]
})
export class AddAdresseIpComponent implements OnInit {

  ipForm!: FormGroup;
  typeConnection: { type: string; }[] = [];

  private readonly ipAddressService = inject(IpAddressService);
  private readonly toastr = inject(ToastrService);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);

  constructor() {
    this.initForm();
  }

  initForm() {
    this.ipForm = this.fb.group({
      label: ['', Validators.required],
      value: ['', [Validators.required, Validators.pattern(/^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/)]],
      jdbcUser: [''],
      jdbcPass: [''],
      url: [''],
      typeConnection: ['SSH'],
      dbName: ['']
    });
  }

  ngOnInit() {
    this.typeConnection = this.ipAddressService.typeConnection;
  }

  saveIpAddres() {
    if (this.ipForm.invalid) {
      this.toastr.warning(
        this.translate.instant('WEB_ACCOUNTS.FILL_REQUIRED'), 
        this.translate.instant('COMMON.WARNING')
      );
      return;
    }

    this.ipAddressService.saveIpAddress(this.ipForm.value).subscribe({
      next: () => {
        this.toastr.success(
          this.translate.instant('IP_ADDRESS.SAVED'), 
          this.translate.instant('COMMON.SUCCESS')
        );
        this.ipForm.reset({ typeConnection: 'SSH' });
      },
      error: () => {
        this.toastr.error(
          this.translate.instant('IP_ADDRESS.ERROR_SAVING'), 
          this.translate.instant('COMMON.ERROR')
        );
      }
    });
  }
}
