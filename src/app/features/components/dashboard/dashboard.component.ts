import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CommonUtil } from '../../../shared/utilities/CommonUtil';
import { UserResponseDto } from '../../../auth/components/login/Interfaces/LoginResponse';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  user: UserResponseDto | null = null;

  constructor(private commonUtil: CommonUtil) {}

  ngOnInit(): void {
    this.user = this.commonUtil.getCurrentUser();
  }
}
