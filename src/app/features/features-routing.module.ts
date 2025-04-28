import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from '../auth/AuthGuard/Auth.guard';
import { ExpensesListComponent } from './components/expenses-list/expenses-list.component';
import { ExpenseCreationComponent } from './components/expense-creation/expense-creation.component';

const routes: Routes = [
 
  {path: 'dashboard', component:DashboardComponent, canActivate: [AuthGuard] },
  {path: 'ExpensesList', component:ExpensesListComponent, canActivate: [AuthGuard] },
  {path: 'ExpenseCreation', component:ExpenseCreationComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeaturesRoutingModule { }
