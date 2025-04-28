import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SearchableDropdownComponent } from './components/searchable-dropdown/searchable-dropdown.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [SidebarComponent,  SearchableDropdownComponent],
  imports: [CommonModule, FormsModule],
  exports: [SidebarComponent,  SearchableDropdownComponent],
})
export class SharedModule {}
