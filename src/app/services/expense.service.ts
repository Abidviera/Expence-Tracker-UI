import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExpensePaginationRequest } from '../models/ExpensePaginationRequest.model';
import {
  Expense,
  ExpenseCreate,
  ExpenseUpdateDto,
} from '../models/Expense.model';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private readonly apiUrl = `${environment.apiUrl}`;
  constructor(private http: HttpClient) {}

  getPagedExpenses(request: ExpensePaginationRequest): Observable<any> {
    let params = new HttpParams();

    Object.keys(request).forEach((key) => {
      const value = (request as any)[key];
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value);
      }
    });

    return this.http.get(`${this.apiUrl}GetAllExpensesWithPagination`, {
      params,
    });
  }

  createExpense(expense: ExpenseCreate): Observable<Expense> {
    return this.http.post<Expense>(`${this.apiUrl}CreateExpense`, expense);
  }

  getExpenseById(expenseId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}GetExpenseById/${expenseId}`);
  }

  updateExpense(expenseId: string, expense: ExpenseUpdateDto): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}${expenseId}`, expense);
  }

  deleteExpense(expenseId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/DeleteExpense/${expenseId}`);
  }
}
