import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCompteServerComponent } from './add-compte-server.component';

describe('AddCompteServerComponent', () => {
  let component: AddCompteServerComponent;
  let fixture: ComponentFixture<AddCompteServerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCompteServerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCompteServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
