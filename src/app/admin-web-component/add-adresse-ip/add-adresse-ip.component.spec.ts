import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';

import { AddAdresseIpComponent } from './add-adresse-ip.component';

describe('AddAdresseIpComponent', () => {
  let component: AddAdresseIpComponent;
  let fixture: ComponentFixture<AddAdresseIpComponent>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter([]), importProvidersFrom(ToastrModule.forRoot())],
      imports: [TranslateModule.forRoot(), AddAdresseIpComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AddAdresseIpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
