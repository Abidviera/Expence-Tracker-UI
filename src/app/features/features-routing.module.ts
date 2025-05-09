import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from '../auth/AuthGuard/Auth.guard';
import { ExpensesListComponent } from './components/expenses-list/expenses-list.component';
import { ExpenseCreationComponent } from './components/expense-creation/expense-creation.component';
import { IncomeCreationComponent } from './components/income-creation/income-creation.component';
import { IncomeListComponent } from './components/income-list/income-list.component';


const routes: Routes = [
 
  {path: 'dashboard', component:DashboardComponent, canActivate: [AuthGuard] },
  {path: 'ExpensesList', component:ExpensesListComponent, canActivate: [AuthGuard] },
  {path: 'ExpenseCreation', component:ExpenseCreationComponent, canActivate: [AuthGuard] },
  {path: 'incomes/new', component:IncomeCreationComponent, canActivate: [AuthGuard] },
  { path: 'incomesList', component: IncomeListComponent, canActivate: [AuthGuard]  },
  { path: 'incomes/edit/:id', component: IncomeCreationComponent ,canActivate: [AuthGuard]},
  { path: 'expense/edit/:id', component: ExpenseCreationComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeaturesRoutingModule { }
