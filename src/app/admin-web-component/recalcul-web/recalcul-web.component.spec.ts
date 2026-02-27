import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecalculWebComponent } from './recalcul-web.component';

describe('RecalculWebComponent', () => {
  let component: RecalculWebComponent;
  let fixture: ComponentFixture<RecalculWebComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [RecalculWebComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(RecalculWebComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
