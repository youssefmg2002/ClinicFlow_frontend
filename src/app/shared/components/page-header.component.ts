import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        @if (breadcrumbs().length > 0) {
          <nav class="flex items-center gap-1.5 text-xs text-text-muted mb-2 font-medium" aria-label="مسار التنقل">
            @for (item of breadcrumbs(); track item.label; let last = $last) {
              @if (item.url && !last) {
                <a [routerLink]="item.url" class="hover:text-primary transition-colors">
                  {{ item.label }}
                </a>
                <span class="text-slate-400">/</span>
              } @else {
                <span [ngClass]="last ? 'text-text-main font-semibold' : ''">{{ item.label }}</span>
              }
            }
          </nav>
        }

        <div class="flex items-center gap-3">
          <h1 class="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight font-sans">
            {{ title() }}
          </h1>
          @if (badge()) {
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-primary border border-blue-200">
              {{ badge() }}
            </span>
          }
        </div>

        @if (subtitle()) {
          <p class="text-xs sm:text-sm text-text-muted mt-1 max-w-2xl">{{ subtitle() }}</p>
        }
      </div>

      <!-- Action Button Area -->
      <div class="flex items-center gap-3 shrink-0">
        <ng-content select="[actions]"></ng-content>
      </div>
    </div>
  `
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>('');
  badge = input<string>('');
  breadcrumbs = input<BreadcrumbItem[]>([]);
}

