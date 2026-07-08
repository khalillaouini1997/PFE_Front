import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';

import { ConfigurationWebComponentComponent } from './configuration-web-component.component';

describe('ConfigurationWebComponentComponent', () => {
  let component: ConfigurationWebComponentComponent;
  let fixture: ComponentFixture<ConfigurationWebComponentComponent>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideRouter([]), importProvidersFrom(ToastrModule.forRoot())],
    imports: [ConfigurationWebComponentComponent, TranslateModule.forRoot()]
})
    .compileComponents();

    fixture = TestBed.createComponent(ConfigurationWebComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
