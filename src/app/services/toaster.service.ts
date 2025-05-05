import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export enum ToastType {
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
  Custom = 'custom'
}

export interface ToastMessage {
  id: number;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  showClose?: boolean;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToasterService {
  private messages: ToastMessage[] = [];
  private messageId = 0;
  private messageSource = new Subject<ToastMessage[]>();
  
  messages$ = this.messageSource.asObservable();

  constructor() {}

  private addMessage(options: Omit<ToastMessage, 'id'>) {
    const id = this.messageId++;
    const defaultOptions: Partial<ToastMessage> = {
      duration: 5000,
      showClose: true
    };
    
    const newMessage: ToastMessage = { 
      id, 
      ...defaultOptions, 
      ...options 
    };
    
    this.messages = [...this.messages, newMessage];
    this.messageSource.next(this.messages);

    if (newMessage.duration && newMessage.duration > 0) {
      setTimeout(() => this.removeMessage(id), newMessage.duration);
    }
  }

  success(message: string, title?: string, options?: Partial<ToastMessage>) {
    this.addMessage({
      type: ToastType.Success,
      message,
      title: title || 'Success',
      icon: 'bi bi-check-circle-fill',
      ...options
    });
  }

  error(message: string, title?: string, options?: Partial<ToastMessage>) {
    this.addMessage({
      type: ToastType.Error,
      message,
      title: title || 'Error',
      icon: 'bi bi-x-circle-fill',
      ...options
    });
  }

  warning(message: string, title?: string, options?: Partial<ToastMessage>) {
    this.addMessage({
      type: ToastType.Warning,
      message,
      title: title || 'Warning',
      icon: 'bi bi-exclamation-triangle-fill',
      ...options
    });
  }

  info(message: string, title?: string, options?: Partial<ToastMessage>) {
    this.addMessage({
      type: ToastType.Info,
      message,
      title: title || 'Info',
      icon: 'bi bi-info-circle',
      ...options
    });
  }

  custom(message: string, options: Omit<ToastMessage, 'id' | 'message'>) {
    this.addMessage({
      message,
      ...options
    });
  }

  removeMessage(id: number) {
    this.messages = this.messages.filter(msg => msg.id !== id);
    this.messageSource.next(this.messages);
  }

  clearAll() {
    this.messages = [];
    this.messageSource.next(this.messages);
  }
}
