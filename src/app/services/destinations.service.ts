import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Destinations } from '../models/Destinations.model';

@Injectable({
  providedIn: 'root'
})
export class DestinationsService {
  private readonly apiUrl = `${environment.apiUrl}`;
 
  constructor(private http: HttpClient) { }


  getAllDestinations(): Observable<Destinations[]> {
    return this.http.get<Destinations[]>(`${this.apiUrl}api/Destinations`);
  }
}
