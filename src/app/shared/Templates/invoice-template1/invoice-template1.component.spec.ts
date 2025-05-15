import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceTemplate1Component } from './invoice-template1.component';

describe('InvoiceTemplate1Component', () => {
  let component: InvoiceTemplate1Component;
  let fixture: ComponentFixture<InvoiceTemplate1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InvoiceTemplate1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceTemplate1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
