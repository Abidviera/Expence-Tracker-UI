import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CategoryDTO {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface CategoryCreateDto {
  name: string;
  description?: string;
}

export interface CategoryUpdateDto {
  name: string;
  description?: string;
}

export interface CategoryPaginationRequest {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortColumn?: string;
  sortDirection?: string;
}

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
export class CategoryService {
  private readonly apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<CategoryDTO[]> {
    return this.http.get<CategoryDTO[]>(`${this.apiUrl}api/Category`);
  }

  getPagedCategories(request: CategoryPaginationRequest): Observable<PaginationResponse<CategoryDTO>> {
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

    return this.http.get<PaginationResponse<CategoryDTO>>(`${this.apiUrl}api/Category/paged`, { params });
  }

  getCategoryById(id: string): Observable<CategoryDTO> {
    return this.http.get<CategoryDTO>(`${this.apiUrl}api/Category/${id}`);
  }

  createCategory(dto: CategoryCreateDto): Observable<CategoryDTO> {
    return this.http.post<CategoryDTO>(`${this.apiUrl}api/Category`, dto);
  }

  updateCategory(id: string, dto: CategoryUpdateDto): Observable<any> {
    return this.http.put(`${this.apiUrl}api/Category/${id}`, dto);
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}api/Category/${id}`);
  }
}
