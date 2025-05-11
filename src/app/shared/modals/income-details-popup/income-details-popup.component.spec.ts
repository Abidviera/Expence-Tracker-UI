import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeDetailsPopupComponent } from './income-details-popup.component';

describe('IncomeDetailsPopupComponent', () => {
  let component: IncomeDetailsPopupComponent;
  let fixture: ComponentFixture<IncomeDetailsPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IncomeDetailsPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeDetailsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
