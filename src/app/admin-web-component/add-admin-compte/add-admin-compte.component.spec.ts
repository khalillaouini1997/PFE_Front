import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAdminCompteComponent } from './add-admin-compte.component';

describe('AddAdminCompteComponent', () => {
  let component: AddAdminCompteComponent;
  let fixture: ComponentFixture<AddAdminCompteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAdminCompteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAdminCompteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
