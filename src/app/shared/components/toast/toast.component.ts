import { Component } from '@angular/core';
import { ToasterService, ToastMessage, ToastType } from '../../../services/toaster.service';
import { Subscription } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatIconModule } from '@angular/material/icon'; 
@Component({
  selector: 'app-toast',
  standalone: false,
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(100%)' }))
      ])
    ])
  ]
})
export class ToastComponent {
  messages: ToastMessage[] = [];
  private subscription!: Subscription;

  constructor(private toastService: ToasterService) {}

  ngOnInit() {
    this.subscription = this.toastService.messages$.subscribe(messages => {
      this.messages = messages;
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  getIcon(type: ToastType): string {
    switch (type) {
      case ToastType.Success: return 'check_circle';
      case ToastType.Error: return 'error';
      case ToastType.Warning: return 'warning';
      case ToastType.Info: return 'bi bi-info-circle';
      default: return 'notifications';
    }
  }

  getColorClass(type: ToastType): string {
    return `toast-${type}`;
  }

  removeMessage(id: number) {
    this.toastService.removeMessage(id);
  }
}
