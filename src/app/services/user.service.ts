import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from './notification.service';
import { CommonUtil } from '../shared/utilities/CommonUtil';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient,
    private router: Router,
    private notificationService: NotificationService,
    private commonUtil: CommonUtil
  ) { }

 
}
