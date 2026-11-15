import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative w-full max-w-md">
      <div class="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-text-muted">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <input
        type="text"
        [ngModel]="searchTerm()"
        (ngModelChange)="onSearchChange($event)"
        [placeholder]="placeholder()"
        class="w-full pl-9 pr-10 py-2 bg-white border border-border-main rounded-xl text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-150"
      />

      @if (searchTerm()) {
        <button
          type="button"
          (click)="clear()"
          aria-label="مسح البحث"
          class="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted hover:text-text-main"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </button>
      }
    </div>
  `
})
export class SearchInputComponent {
  placeholder = input<string>('ابحث بالاسم أو رقم الهاتف...');
  search = output<string>();

  searchTerm = signal<string>('');

  private debounceTimer: any = null;

  onSearchChange(val: string): void {
    this.searchTerm.set(val);
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.search.emit(val.trim());
    }, 300);
  }

  clear(): void {
    this.searchTerm.set('');
    this.search.emit('');
  }
}

