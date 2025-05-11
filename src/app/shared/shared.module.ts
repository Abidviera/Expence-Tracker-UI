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


@NgModule({
  declarations: [SidebarComponent,  SearchableDropdownComponent,  ToastComponent, ConfirmationModalComponent, ExportModalComponent, IncomeDetailsPopupComponent],
  imports: [CommonModule, FormsModule,  MatIconModule, NgbModule],
  exports: [SidebarComponent,  SearchableDropdownComponent , ToastComponent, ConfirmationModalComponent, NgbModule, ExportModalComponent, IncomeDetailsPopupComponent],
})
export class SharedModule {}
