import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceTemplate5Component } from './invoice-template5.component';

describe('InvoiceTemplate5Component', () => {
  let component: InvoiceTemplate5Component;
  let fixture: ComponentFixture<InvoiceTemplate5Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InvoiceTemplate5Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceTemplate5Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
