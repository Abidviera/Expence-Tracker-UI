import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Income, IncomeDto } from '../models/Income.model';
import { catchError, Observable, throwError } from 'rxjs';
import { IncomePaginationRequest, PaginationResponse } from '../models/IncomePaginationRequest.model';

@Injectable({
  providedIn: 'root'
})
export class IncomeService {
  private apiUrl = `${environment.apiUrl}api/income`;

  constructor(private http: HttpClient) { }

  getAllIncomes(): Observable<Income[]> {
    return this.http.get<Income[]>(this.apiUrl);
  }

  getIncomesByUser(userId: string): Observable<Income[]> {
    return this.http.get<Income[]>(`${this.apiUrl}/user/${userId}`);
  }

  getIncomeById(id: string): Observable<Income> {
    return this.http.get<Income>(`${this.apiUrl}/${id}`);
  }

  createIncome(incomeDto: IncomeDto): Observable<Income> {
    return this.http.post<Income>(this.apiUrl, incomeDto);
  }

  updateIncome(id: string, incomeDto: IncomeDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, incomeDto);
  }

  deleteIncome(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getPagedIncomes(request: IncomePaginationRequest): Observable<PaginationResponse<Income>> {
    let params = new HttpParams();

    Object.keys(request).forEach(key => {
      const value = (request as any)[key];
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<PaginationResponse<Income>>(`${this.apiUrl}/paged`, { params });
  }
}
