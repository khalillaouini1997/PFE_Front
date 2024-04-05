import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAdresseIpComponent } from './add-adresse-ip.component';

describe('AddAdresseIpComponent', () => {
  let component: AddAdresseIpComponent;
  let fixture: ComponentFixture<AddAdresseIpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddAdresseIpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAdresseIpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
