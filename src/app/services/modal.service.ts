import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationModalComponent } from '../shared/components/confirmation-modal/confirmation-modal.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

 constructor(private modalService: NgbModal,
  private ngbModal: NgbModal
 ) {}

 open(component: any, options?: any) {
    return this.ngbModal.open(component, options);
  }

 confirm(
    title: string,
    message: string = 'Are you sure you want to perform this action?'
  ): Promise<boolean> {
    const modalRef = this.modalService.open(ConfirmationModalComponent,{
         animation: false 
    });
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.message = message;
    
    return modalRef.result.then(
      (result) => !!result,
      () => false
    );
  }
}
