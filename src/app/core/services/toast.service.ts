import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(type: ToastMessage['type'], message: string, title?: string, duration: number = 4000): void {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, type, title, message, duration };
    this._toasts.update(current => [...current, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  success(message: string, title?: string): void {
    this.show('success', message, title || 'تم بنجاح');
  }

  error(message: string, title?: string): void {
    this.show('error', message, title || 'حدث خطأ');
  }

  warning(message: string, title?: string): void {
    this.show('warning', message, title || 'تنبيه');
  }

  info(message: string, title?: string): void {
    this.show('info', message, title || 'معلومة');
  }

  remove(id: string): void {
    this._toasts.update(current => current.filter(t => t.id !== id));
  }

  clear(): void {
    this._toasts.set([]);
  }
}

