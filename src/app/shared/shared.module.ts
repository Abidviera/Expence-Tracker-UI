import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SearchableDropdownComponent } from './components/searchable-dropdown/searchable-dropdown.component';
import { FormsModule } from '@angular/forms';
import { ToastComponent } from './components/toast/toast.component';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [SidebarComponent,  SearchableDropdownComponent,  ToastComponent],
  imports: [CommonModule, FormsModule,  MatIconModule, ],
  exports: [SidebarComponent,  SearchableDropdownComponent , ToastComponent],
})
export class SharedModule {}
