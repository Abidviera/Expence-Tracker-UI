import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeaturesRoutingModule } from './features-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SharedModule } from '../shared/shared.module';
import { ExpensesListComponent } from './components/expenses-list/expenses-list.component';
import { ExpenseCreationComponent } from './components/expense-creation/expense-creation.component';
import { FormsModule } from '@angular/forms';
import { IncomeCreationComponent } from './components/income-creation/income-creation.component';
import { IncomeListComponent } from './components/income-list/income-list.component';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ProfitManagementComponent } from './components/profit-management/profit-management.component';


@NgModule({
  declarations: [
    DashboardComponent,
    ExpensesListComponent,
    ExpenseCreationComponent,
    IncomeCreationComponent,
    IncomeListComponent,
    ProfitManagementComponent,
    
  ],
  imports: [
    CommonModule,
    FeaturesRoutingModule,
    SharedModule,
    FormsModule,
    NgbModalModule
  ]
})
export class FeaturesModule { }
