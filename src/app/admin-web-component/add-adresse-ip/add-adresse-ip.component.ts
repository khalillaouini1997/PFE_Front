import { Component, OnInit, inject } from '@angular/core';
import { IpAddress } from "../../data/data";
import { IpAddressService } from "../../service/ip-address.service";
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-adresse-ip',
  templateUrl: './add-adresse-ip.component.html',
  styleUrls: ['./add-adresse-ip.component.css'],
  standalone: true,
  imports: [FormsModule, NgFor]
})
export class AddAdresseIpComponent implements OnInit {

  ipAddress: IpAddress = new IpAddress();
  typeConnection: { type: string; }[] = [];

  private readonly ipAddressService = inject(IpAddressService);
  private readonly toastr = inject(ToastrService);

  ngOnInit() {
    this.typeConnection = this.ipAddressService.typeConnection;
  }

  saveIpAddres() {
    this.ipAddressService.saveIpAddress(this.ipAddress).subscribe({
      next: () => {
        this.toastr.success('IP Address saved', 'Success');
        this.ipAddress = new IpAddress();
      },
      error: () => {
        this.toastr.error('Error saving IP address', 'Error');
      }
    });
  }
}
