import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CurrencyDTO,
  CurrencyCreateDto,
  CurrencyUpdateDto,
  CurrencyPaginationRequest
} from '../models/currency.model';

export interface PaginationResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  data: T[];
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private readonly apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getAllCurrencies(): Observable<CurrencyDTO[]> {
    return this.http.get<CurrencyDTO[]>(`${this.apiUrl}api/Currency`);
  }

  getActiveCurrencies(): Observable<CurrencyDTO[]> {
    return this.http.get<CurrencyDTO[]>(`${this.apiUrl}api/Currency/active`);
  }

  getPagedCurrencies(request: CurrencyPaginationRequest): Observable<PaginationResponse<CurrencyDTO>> {
    let params = new HttpParams()
      .set('pageNumber', request.pageNumber.toString())
      .set('pageSize', request.pageSize.toString());

    if (request.searchTerm) {
      params = params.set('searchTerm', request.searchTerm);
    }
    if (request.sortColumn) {
      params = params.set('sortColumn', request.sortColumn);
    }
    if (request.sortDirection) {
      params = params.set('sortDirection', request.sortDirection);
    }

    return this.http.get<PaginationResponse<CurrencyDTO>>(`${this.apiUrl}api/Currency/paged`, { params });
  }

  getCurrencyById(id: string): Observable<CurrencyDTO> {
    return this.http.get<CurrencyDTO>(`${this.apiUrl}api/Currency/${id}`);
  }

  createCurrency(dto: CurrencyCreateDto): Observable<CurrencyDTO> {
    return this.http.post<CurrencyDTO>(`${this.apiUrl}api/Currency`, dto);
  }

  updateCurrency(id: string, dto: CurrencyUpdateDto): Observable<any> {
    return this.http.put(`${this.apiUrl}api/Currency/${id}`, dto);
  }

  deleteCurrency(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}api/Currency/${id}`);
  }
}
