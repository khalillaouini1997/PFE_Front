import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';

import { ListTraccarComponent } from './list-traccar.component';

describe('ListTraccarComponent', () => {
  let component: ListTraccarComponent;
  let fixture: ComponentFixture<ListTraccarComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
    imports: [ListTraccarComponent]
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
