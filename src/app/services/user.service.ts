import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from './notification.service';
import { CommonUtil } from '../shared/utilities/CommonUtil';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class UserService {
private readonly apiUrl = `${environment.apiUrl}`;

  constructor(
    private http: HttpClient,

  ) { }

   getUsers(): Observable<User[]> {
     return this.http.get<User[]>(`${this.apiUrl}GetAllUsers`);
   }

}
