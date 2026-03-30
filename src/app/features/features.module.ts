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
import { UserManagementComponent } from './components/user-management/user-management.component';
import { ApprovalsComponent } from './components/approvals/approvals.component';
import { ProfileManagementComponent } from './components/profile-management/profile-management.component';
import { CustomersListComponent } from './components/customers-list/customers-list.component';
import { CustomerCreationComponent } from './components/customer-creation/customer-creation.component';
import { CountryListComponent } from './components/country-list/country-list.component';
import { CountryMasterComponent } from './components/country-master/country-master.component';
import { LocationListComponent } from './components/location-list/location-list.component';
import { LocationMasterComponent } from './components/location-master/location-master.component';


@NgModule({
  declarations: [
    DashboardComponent,
    ExpensesListComponent,
    ExpenseCreationComponent,
    IncomeCreationComponent,
    IncomeListComponent,
    ProfitManagementComponent,
    UserManagementComponent,
    ApprovalsComponent,
    ProfileManagementComponent,
    CustomersListComponent,
    CustomerCreationComponent,
    CountryListComponent,
    CountryMasterComponent,
    LocationListComponent,
    LocationMasterComponent,
  ],
  imports: [
    CommonModule,
    FeaturesRoutingModule,
    SharedModule,
    FormsModule,
    NgbModalModule
  ],
})
export class FeaturesModule { }
