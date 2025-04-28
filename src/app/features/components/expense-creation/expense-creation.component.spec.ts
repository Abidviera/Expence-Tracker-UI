import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseCreationComponent } from './expense-creation.component';

describe('ExpenseCreationComponent', () => {
  let component: ExpenseCreationComponent;
  let fixture: ComponentFixture<ExpenseCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExpenseCreationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
