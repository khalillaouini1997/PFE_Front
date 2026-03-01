import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTraccarComponent } from './list-traccar.component';

describe('ListTraccarComponent', () => {
  let component: ListTraccarComponent;
  let fixture: ComponentFixture<ListTraccarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [ListTraccarComponent]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListTraccarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
