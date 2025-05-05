import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeCreationComponent } from './income-creation.component';

describe('IncomeCreationComponent', () => {
  let component: IncomeCreationComponent;
  let fixture: ComponentFixture<IncomeCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IncomeCreationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
