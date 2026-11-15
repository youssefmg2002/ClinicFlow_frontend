import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-dashed border-border-main my-4">
      <div class="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary mb-4 shadow-xs">
        <ng-content select="[icon]">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </ng-content>
      </div>

      <h4 class="text-base font-bold text-text-main mb-1">{{ title() }}</h4>
      <p class="text-sm text-text-muted max-w-sm mb-5">{{ message() }}</p>

      @if (actionLabel()) {
        <button
          type="button"
          (click)="actionClick.emit()"
          class="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl shadow-xs transition-colors duration-150 cursor-pointer"
        >
          {{ actionLabel() }}
        </button>
      }
    </div>
  `
})
export class EmptyStateComponent {
  title = input<string>('لا توجد بيانات حالياً');
  message = input<string>('لم يتم العثور على أي سجلات تطابق خيارات البحث الحالية.');
  actionLabel = input<string | null>(null);
  actionClick = output<void>();
}

