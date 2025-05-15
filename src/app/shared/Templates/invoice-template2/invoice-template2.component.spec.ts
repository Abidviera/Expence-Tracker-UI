import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceTemplate2Component } from './invoice-template2.component';

describe('InvoiceTemplate2Component', () => {
  let component: InvoiceTemplate2Component;
  let fixture: ComponentFixture<InvoiceTemplate2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InvoiceTemplate2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceTemplate2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
