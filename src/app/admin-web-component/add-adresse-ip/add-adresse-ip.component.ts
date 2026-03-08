import { Component, OnInit, inject } from '@angular/core';
import { IpAddress } from "../../data/data";
import { IpAddressService } from "../../service/ip-address.service";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-add-adresse-ip',
    templateUrl: './add-adresse-ip.component.html',
    styleUrls: ['./add-adresse-ip.component.css'],
    imports: [ReactiveFormsModule]
})
export class AddAdresseIpComponent implements OnInit {

  ipForm!: FormGroup;
  typeConnection: { type: string; }[] = [];

  private readonly ipAddressService = inject(IpAddressService);
  private readonly toastr = inject(ToastrService);
  private readonly fb = inject(FormBuilder);

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
      this.toastr.warning('Please fill all required fields correctly', 'Warning');
      return;
    }

    this.ipAddressService.saveIpAddress(this.ipForm.value).subscribe({
      next: () => {
        this.toastr.success('IP Address saved', 'Success');
        this.ipForm.reset({ typeConnection: 'SSH' });
      },
      error: () => {
        this.toastr.error('Error saving IP address', 'Error');
      }
    });
  }
}
