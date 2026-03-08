import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';

import { IpAdresseComponent } from './ip-adresse.component';

describe('IpAdresseComponent', () => {
  let component: IpAdresseComponent;
  let fixture: ComponentFixture<IpAdresseComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
    imports: [IpAdresseComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IpAdresseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
