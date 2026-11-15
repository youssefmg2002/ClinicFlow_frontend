import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed top-24 left-5 z-40 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      dir="rtl"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto p-4 rounded-xl border shadow-lg transition-all duration-300 flex items-start gap-3 text-sm animate-in slide-in-from-top-2"
          [ngClass]="toastClasses(toast.type)"
        >
          <!-- Icon -->
          <div class="shrink-0 mt-0.5">
            @switch (toast.type) {
              @case ('success') {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              }
              @case ('error') {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-rose-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              }
              @case ('warning') {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              }
              @default {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              }
            }
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            @if (toast.title) {
              <h5 class="font-bold mb-0.5 text-xs text-text-main">{{ toast.title }}</h5>
            }
            <p class="text-xs text-text-muted leading-relaxed">{{ toast.message }}</p>
          </div>

          <!-- Close button -->
          <button
            type="button"
            (click)="toastService.remove(toast.id)"
            class="shrink-0 text-text-muted hover:text-text-main cursor-pointer p-0.5"
            aria-label="إغلاق التنبيه"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);

  toastClasses(type: ToastMessage['type']): string {
    switch (type) {
      case 'success':
        return 'bg-white border-emerald-200 shadow-emerald-500/10';
      case 'error':
        return 'bg-white border-rose-200 shadow-rose-500/10';
      case 'warning':
        return 'bg-white border-amber-200 shadow-amber-500/10';
      case 'info':
      default:
        return 'bg-white border-blue-200 shadow-blue-500/10';
    }
  }
}

