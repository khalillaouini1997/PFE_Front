import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';

import { AddAdminCompteComponent } from './add-admin-compte.component';

describe('AddAdminCompteComponent', () => {
  let component: AddAdminCompteComponent;
  let fixture: ComponentFixture<AddAdminCompteComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
    imports: [AddAdminCompteComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAdminCompteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
