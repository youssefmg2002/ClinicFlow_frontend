import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="bg-white rounded-2xl p-5 border border-border-main shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between gap-4"
    >
      <div class="flex-1 min-w-0">
        <p class="text-xs font-medium text-text-muted mb-1 truncate">{{ title() }}</p>
        <div class="flex items-baseline gap-2">
          <h3 class="text-2xl font-extrabold text-text-main tracking-tight font-sans">
            {{ formattedValue() }}
          </h3>
          @if (unit()) {
            <span class="text-xs font-semibold text-text-muted">{{ unit() }}</span>
          }
        </div>
        @if (subtitle()) {
          <p class="text-xs text-text-muted mt-1.5 flex items-center gap-1">
            <span [ngClass]="deltaClass()">{{ subtitle() }}</span>
          </p>
        }
      </div>

      <div
        class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
        [ngClass]="iconContainerClass()"
      >
        <ng-content select="[icon]"></ng-content>
      </div>
    </div>
  `
})
export class StatCardComponent {
  title = input.required<string>();
  value = input.required<number | string>();
  unit = input<string>('');
  subtitle = input<string>('');
  variant = input<'blue' | 'emerald' | 'amber' | 'rose' | 'navy'>('blue');
  deltaPositive = input<boolean | null>(null);

  formattedValue(): string {
    const val = this.value();
    if (typeof val === 'number') {
      return val.toLocaleString('ar-EG');
    }
    return val;
  }

  iconContainerClass(): string {
    switch (this.variant()) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'amber':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'rose':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'navy':
        return 'bg-slate-100 text-navy-sidebar border-slate-200';
      case 'blue':
      default:
        return 'bg-blue-50 text-primary border-blue-100';
    }
  }

  deltaClass(): string {
    if (this.deltaPositive() === true) return 'text-emerald-600 font-semibold';
    if (this.deltaPositive() === false) return 'text-rose-600 font-semibold';
    return 'text-text-muted';
  }
}

