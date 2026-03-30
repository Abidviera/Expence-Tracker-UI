import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ReportRequest, ReportResponse } from '../models/Country.model';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private readonly reportApiUrl = `${environment.apiUrl}api/Report`;

  constructor(private http: HttpClient) {}

  generateReport(request: ReportRequest): Observable<ReportResponse> {
    return this.http.post<ReportResponse>(`${this.reportApiUrl}/generate`, request);
  }
}
