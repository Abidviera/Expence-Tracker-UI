import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Country,
  CountryCreateDto,
  CountryUpdateDto,
  CountryPaginationRequest,
  PaginationResponse,
  Location,
  LocationCreateDto,
  LocationUpdateDto,
  LocationPaginationRequest,
} from '../models/Country.model';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private readonly countryApiUrl = `${environment.apiUrl}api/Country`;
  private readonly locationApiUrl = `${environment.apiUrl}api/Location`;

  constructor(private http: HttpClient) {}

  // Country APIs
  getCountries(): Observable<PaginationResponse<Country>> {
    return this.http.get<PaginationResponse<Country>>(this.countryApiUrl);
  }

  getActiveCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(`${this.countryApiUrl}/active`);
  }

  getPagedCountries(request: CountryPaginationRequest): Observable<PaginationResponse<Country>> {
    let params = new HttpParams();
    Object.keys(request).forEach((key) => {
      const value = (request as any)[key];
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    });
    return this.http.get<PaginationResponse<Country>>(`${this.countryApiUrl}/paged`, { params });
  }

  getCountryById(id: string): Observable<Country> {
    return this.http.get<Country>(`${this.countryApiUrl}/${id}`);
  }

  createCountry(country: CountryCreateDto): Observable<Country> {
    return this.http.post<Country>(this.countryApiUrl, country);
  }

  updateCountry(id: string, country: CountryUpdateDto): Observable<Country> {
    return this.http.put<Country>(`${this.countryApiUrl}/${id}`, country);
  }

  deleteCountry(id: string): Observable<void> {
    return this.http.delete<void>(`${this.countryApiUrl}/${id}`);
  }

  // Location APIs
  getLocations(): Observable<PaginationResponse<Location>> {
    return this.http.get<PaginationResponse<Location>>(this.locationApiUrl);
  }

  getActiveLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.locationApiUrl}/active`);
  }

  getLocationsByCountry(countryId: string): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.locationApiUrl}/by-country/${countryId}`);
  }

  getPagedLocations(request: LocationPaginationRequest): Observable<PaginationResponse<Location>> {
    let params = new HttpParams();
    Object.keys(request).forEach((key) => {
      const value = (request as any)[key];
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    });
    return this.http.get<PaginationResponse<Location>>(`${this.locationApiUrl}/paged`, { params });
  }

  getLocationById(id: string): Observable<Location> {
    return this.http.get<Location>(`${this.locationApiUrl}/${id}`);
  }

  createLocation(location: LocationCreateDto): Observable<Location> {
    return this.http.post<Location>(this.locationApiUrl, location);
  }

  updateLocation(id: string, location: LocationUpdateDto): Observable<Location> {
    return this.http.put<Location>(`${this.locationApiUrl}/${id}`, location);
  }

  deleteLocation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.locationApiUrl}/${id}`);
  }
}
