import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Customer, CustomerCreateDto, CustomerPaginationRequest, PaginationResponse } from '../models/Customer.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly apiUrl = `${environment.apiUrl}api/Customers`;

  constructor(private http: HttpClient) { }

  getCustomers(): Observable<PaginationResponse<Customer>> {
    return this.http.get<PaginationResponse<Customer>>(this.apiUrl);
  }

  getPagedCustomers(request: CustomerPaginationRequest): Observable<PaginationResponse<Customer>> {
    let params = new HttpParams();
    Object.keys(request).forEach(key => {
      const value = (request as any)[key];
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    });
    return this.http.get<PaginationResponse<Customer>>(`${this.apiUrl}/paged`, { params });
  }

  getCustomerById(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`);
  }

  createCustomer(customer: CustomerCreateDto): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, customer);
  }

  updateCustomer(id: string, customer: CustomerCreateDto): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/${id}`, customer);
  }

  deleteCustomer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
