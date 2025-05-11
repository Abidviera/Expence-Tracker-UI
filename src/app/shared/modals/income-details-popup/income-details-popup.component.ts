import { Component, Input } from '@angular/core';
import { Income } from '../../../models/Income.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-income-details-popup',
  standalone: false,
  templateUrl: './income-details-popup.component.html',
  styleUrl: './income-details-popup.component.scss'
})
export class IncomeDetailsPopupComponent {
@Input() income?: any;

  constructor(public activeModal: NgbActiveModal) {}

  closeModal() {
    this.activeModal.close();
  }
}
