import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';

import { IpAdresseComponent } from './ip-adresse.component';

describe('IpAdresseComponent', () => {
  let component: IpAdresseComponent;
  let fixture: ComponentFixture<IpAdresseComponent>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
    imports: [IpAdresseComponent, TranslateModule.forRoot()]
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
