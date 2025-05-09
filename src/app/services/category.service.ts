import { Injectable } from '@angular/core';
import { Categories } from '../models/ExpenseCategories.model';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
private readonly apiUrl = `${environment.apiUrl}`;
constructor(private http: HttpClient) {}


  getAllCategories(): Observable<Categories[]> {
    return this.http.get<Categories[]>(`${this.apiUrl}api/Category`);
  }
}
