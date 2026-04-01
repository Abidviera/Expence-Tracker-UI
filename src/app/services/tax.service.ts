import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  TaxDTO,
  TaxCreateDto,
  TaxUpdateDto,
  TaxPaginationRequest
} from '../models/tax.model';
import { PaginationResponse } from './currency.service';
export type { PaginationResponse };

@Injectable({
  providedIn: 'root'
})
export class TaxService {
  private readonly apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getAllTaxes(): Observable<TaxDTO[]> {
    return this.http.get<TaxDTO[]>(`${this.apiUrl}api/Tax`);
  }

  getActiveTaxes(): Observable<TaxDTO[]> {
    return this.http.get<TaxDTO[]>(`${this.apiUrl}api/Tax/active`);
  }

  isTaxEnabled(): Observable<{ isEnabled: boolean }> {
    return this.http.get<{ isEnabled: boolean }>(`${this.apiUrl}api/Tax/is-enabled`);
  }

  getPagedTaxes(request: TaxPaginationRequest): Observable<PaginationResponse<TaxDTO>> {
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

    return this.http.get<PaginationResponse<TaxDTO>>(`${this.apiUrl}api/Tax/paged`, { params });
  }

  getTaxById(id: string): Observable<TaxDTO> {
    return this.http.get<TaxDTO>(`${this.apiUrl}api/Tax/${id}`);
  }

  createTax(dto: TaxCreateDto): Observable<TaxDTO> {
    return this.http.post<TaxDTO>(`${this.apiUrl}api/Tax`, dto);
  }

  updateTax(id: string, dto: TaxUpdateDto): Observable<any> {
    return this.http.put(`${this.apiUrl}api/Tax/${id}`, dto);
  }

  deleteTax(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}api/Tax/${id}`);
  }
}
