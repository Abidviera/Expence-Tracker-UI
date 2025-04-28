
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from 'rxjs';
import { UserResponseDto } from "../../auth/components/login/Interfaces/LoginResponse";
import { UserRole } from "../../enums/UserRole.enum";
import { StorageService } from "../../services/storage.service";

@Injectable({
  providedIn: 'root'
})
export class CommonUtil {
  
  private currentUserSubject: BehaviorSubject<UserResponseDto | null>;
  public readonly currentUser$: Observable<UserResponseDto | null>;


  constructor(private storageService: StorageService) {
    const savedUser = this.storageService.getItem('user_info');
    this.currentUserSubject = new BehaviorSubject<UserResponseDto | null>(
      savedUser ? JSON.parse(savedUser) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }
  setCurrentUser(user: UserResponseDto): void {
    this.currentUserSubject.next(user);
    this.storageService.setItem('user_info', JSON.stringify(user));
  }

  getCurrentUser():  UserResponseDto | null {
    return this.currentUserSubject.value;
  }



  clearCurrentUser(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('user_info');
  }

  isVerified(): boolean {
    return this.currentUserSubject.value?.isVerified ?? false;
  }

  getFullName(): string {
    const user = this.currentUserSubject.value;
    return user ? `${user.firstName} ${user.lastName}` : '';
  }
}