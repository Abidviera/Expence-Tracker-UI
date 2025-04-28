import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeaturesRoutingModule } from './features-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SharedModule } from '../shared/shared.module';
import { ExpensesListComponent } from './components/expenses-list/expenses-list.component';
import { ExpenseCreationComponent } from './components/expense-creation/expense-creation.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    DashboardComponent,
    ExpensesListComponent,
    ExpenseCreationComponent,
    
  ],
  imports: [
    CommonModule,
    FeaturesRoutingModule,
    SharedModule,
    FormsModule
  ]
})
export class FeaturesModule { }
