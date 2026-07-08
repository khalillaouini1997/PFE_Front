import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';

import { ListTraccarComponent } from './list-traccar.component';

describe('ListTraccarComponent', () => {
  let component: ListTraccarComponent;
  let fixture: ComponentFixture<ListTraccarComponent>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
    imports: [ListTraccarComponent, TranslateModule.forRoot()]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListTraccarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
