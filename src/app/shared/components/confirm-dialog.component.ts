import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          (click)="cancel.emit()"
        ></div>

        <!-- Center modal wrapper -->
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <div
            class="relative transform overflow-hidden rounded-2xl bg-white text-right shadow-xl transition-all w-full max-w-md p-6 border border-border-main animate-in zoom-in-95 duration-150"
            dir="rtl"
          >
            <!-- Header Icon + Title -->
            <div class="flex items-start gap-4 mb-4">
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
                [ngClass]="isDestructive() ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-blue-50 text-primary border-blue-100'"
              >
                @if (isDestructive()) {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              </div>

              <div class="flex-1">
                <h3 class="text-base font-bold text-text-main leading-tight">{{ title() }}</h3>
                <p class="text-sm text-text-muted mt-1 leading-relaxed">{{ message() }}</p>
              </div>
            </div>

            <!-- Optional slotted extra input or details -->
            <ng-content></ng-content>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border-subtle">
              <button
                type="button"
                (click)="cancel.emit()"
                class="px-4 py-2 text-sm font-semibold text-text-muted hover:text-text-main bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                {{ cancelLabel() }}
              </button>

              <button
                type="button"
                (click)="confirm.emit()"
                [disabled]="isLoading()"
                class="px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                [ngClass]="isDestructive() ? 'bg-rose-600 hover:bg-rose-700' : 'bg-primary hover:bg-primary-hover'"
              >
                @if (isLoading()) {
                  <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                }
                {{ confirmLabel() }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmDialogComponent {
  isOpen = input<boolean>(false);
  title = input<string>('تأكيد الإجراء');
  message = input<string>('هل أنت متأكد من رغبتك في إتمام هذا الإجراء؟');
  confirmLabel = input<string>('تأكيد');
  cancelLabel = input<string>('إلغاء');
  isDestructive = input<boolean>(false);
  isLoading = input<boolean>(false);

  confirm = output<void>();
  cancel = output<void>();
}

