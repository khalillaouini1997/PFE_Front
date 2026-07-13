import {Component, inject, OnInit} from '@angular/core';
import {IpAddressService} from "../../service/ip-address.service";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

import {ToastrService} from 'ngx-toastr';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {withToast} from '../../utils/toast.helpers';
import {PageHeaderComponent} from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-add-adresse-ip',
  standalone: true,
  templateUrl: './add-adresse-ip.component.html',
  styleUrls: ['./add-adresse-ip.component.css'],
  imports: [ReactiveFormsModule, TranslateModule, PageHeaderComponent]
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

    withToast(this.ipAddressService.saveIpAddress(this.ipForm.value), this.toastr, this.translate, 'IP_ADDRESS.SAVED')
      .subscribe({
        next: () => {
          this.ipForm.reset({typeConnection: 'SSH'});
        },
        error: () => {
        }
      });
  }
}
