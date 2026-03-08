import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';

import { AddCompteServerComponent } from './add-compte-server.component';

describe('AddCompteServerComponent', () => {
  let component: AddCompteServerComponent;
  let fixture: ComponentFixture<AddCompteServerComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
    imports: [AddCompteServerComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCompteServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
