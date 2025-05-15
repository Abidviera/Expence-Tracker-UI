import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SearchableDropdownComponent } from './components/searchable-dropdown/searchable-dropdown.component';
import { FormsModule } from '@angular/forms';
import { ToastComponent } from './components/toast/toast.component';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ExportModalComponent } from './modals/export-modal/export-modal.component';
import { IncomeDetailsPopupComponent } from './modals/income-details-popup/income-details-popup.component';
import { InvoiceTemplate1Component } from './Templates/invoice-template1/invoice-template1.component';
import { InvoiceTemplate2Component } from './Templates/invoice-template2/invoice-template2.component';
import { InvoiceTemplate3Component } from './Templates/invoice-template3/invoice-template3.component';
import { InvoiceTemplate4Component } from './Templates/invoice-template4/invoice-template4.component';
import { InvoiceTemplate5Component } from './Templates/invoice-template5/invoice-template5.component';
import { InvoiceTemplate6Component } from './Templates/invoice-template6/invoice-template6.component';
import { InvoiceTemplate7Component } from './Templates/invoice-template7/invoice-template7.component';


@NgModule({
  declarations: [SidebarComponent,  SearchableDropdownComponent,  ToastComponent, ConfirmationModalComponent, ExportModalComponent, IncomeDetailsPopupComponent, InvoiceTemplate1Component, InvoiceTemplate2Component, InvoiceTemplate3Component, InvoiceTemplate4Component, InvoiceTemplate5Component, InvoiceTemplate6Component, InvoiceTemplate7Component],
  imports: [CommonModule, FormsModule,  MatIconModule, NgbModule],
  exports: [SidebarComponent,  SearchableDropdownComponent , ToastComponent, ConfirmationModalComponent, NgbModule, ExportModalComponent, IncomeDetailsPopupComponent, InvoiceTemplate1Component, InvoiceTemplate2Component, InvoiceTemplate3Component, InvoiceTemplate4Component, InvoiceTemplate5Component, InvoiceTemplate6Component, InvoiceTemplate7Component],
})
export class SharedModule {}
