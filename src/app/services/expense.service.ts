import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExpensePaginationRequest } from '../models/ExpensePaginationRequest.model';
import { Expense } from '../models/Expense.model';
import { ExpenseCategory } from '../enums/ExpenseCategory.enum';
import { ExpenseCategories } from '../models/ExpenseCategories.model';
@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
private readonly apiUrl = `${environment.apiUrl}`;
constructor(private http: HttpClient) {}


getPagedExpenses(request: ExpensePaginationRequest): Observable<any> {
  let params = new HttpParams();


  Object.keys(request).forEach(key => {
    const value = (request as any)[key];
    if (value !== null && value !== undefined && value !== '') {
      params = params.set(key, value);
    }
  });

  return this.http.get(`${this.apiUrl}GetAllExpensesWithPagination`, { params });
}


createExpense(expense: Expense): Observable<Expense>{
  return this.http.post<Expense>(`${this.apiUrl}CreateExpense`, expense)
}

getExpenseCategories(): ExpenseCategory[] {
  return Object.values(ExpenseCategory);
}



  getAllExpenseCategories(): Observable<ExpenseCategories[]> {
    return this.http.get<ExpenseCategories[]>(`${this.apiUrl}GetAllExpenseCategory`);
  }
}
