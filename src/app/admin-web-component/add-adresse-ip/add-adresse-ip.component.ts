import { Component, OnInit } from '@angular/core';
import {IpAddress} from "../../data/data";
import {DataService} from "../../service/data.service";
import {CompteServerService} from "../../service/compte-server.service";

@Component({
  selector: 'app-add-adresse-ip',
  templateUrl: './add-adresse-ip.component.html',
  styleUrls: ['./add-adresse-ip.component.css']
})
export class AddAdresseIpComponent implements OnInit {

  ipAddress: IpAddress = new IpAddress();
  typeConnection: { type: string; }[] = [];

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.typeConnection = this.dataService.typeConnection;
  }

  // sauvgarder une adresse Ip
  saveIpAddres() {

    this.dataService.saveIpAddres(this.ipAddress).subscribe(res => {

    });
    this.ipAddress = new IpAddress();
  }
}
