import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfitManagementComponent } from './profit-management.component';

describe('ProfitManagementComponent', () => {
  let component: ProfitManagementComponent;
  let fixture: ComponentFixture<ProfitManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfitManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfitManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
