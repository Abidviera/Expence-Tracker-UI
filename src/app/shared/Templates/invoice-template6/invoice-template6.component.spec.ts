import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceTemplate6Component } from './invoice-template6.component';

describe('InvoiceTemplate6Component', () => {
  let component: InvoiceTemplate6Component;
  let fixture: ComponentFixture<InvoiceTemplate6Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InvoiceTemplate6Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceTemplate6Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
