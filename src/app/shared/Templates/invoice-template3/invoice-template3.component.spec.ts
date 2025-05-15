import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceTemplate3Component } from './invoice-template3.component';

describe('InvoiceTemplate3Component', () => {
  let component: InvoiceTemplate3Component;
  let fixture: ComponentFixture<InvoiceTemplate3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InvoiceTemplate3Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceTemplate3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
