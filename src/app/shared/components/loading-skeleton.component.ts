import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (type() === 'card') {
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        @for (i of countArray(); track i) {
          <div class="bg-white rounded-2xl p-5 border border-border-main flex items-center justify-between">
            <div class="space-y-2.5 flex-1">
              <div class="h-3 bg-slate-200 rounded-full w-24"></div>
              <div class="h-7 bg-slate-200 rounded-full w-16"></div>
              <div class="h-2.5 bg-slate-100 rounded-full w-32"></div>
            </div>
            <div class="w-12 h-12 rounded-xl bg-slate-100"></div>
          </div>
        }
      </div>
    } @else if (type() === 'table') {
      <div class="bg-white rounded-2xl border border-border-main overflow-hidden p-4 space-y-4 animate-pulse">
        <div class="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div class="h-5 bg-slate-200 rounded-full w-36"></div>
          <div class="h-9 bg-slate-100 rounded-xl w-48"></div>
        </div>
        @for (i of countArray(); track i) {
          <div class="flex items-center justify-between py-3 border-b border-border-subtle last:border-0">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-slate-200"></div>
              <div class="space-y-1.5">
                <div class="h-3.5 bg-slate-200 rounded-full w-32"></div>
                <div class="h-2.5 bg-slate-100 rounded-full w-20"></div>
              </div>
            </div>
            <div class="h-3.5 bg-slate-200 rounded-full w-24 hidden sm:block"></div>
            <div class="h-6 bg-slate-100 rounded-full w-16"></div>
          </div>
        }
      </div>
    } @else {
      <div class="space-y-3 animate-pulse">
        @for (i of countArray(); track i) {
          <div class="h-4 bg-slate-200 rounded-full w-full"></div>
        }
      </div>
    }
  `
})
export class LoadingSkeletonComponent {
  type = input<'card' | 'table' | 'text'>('card');
  count = input<number>(4);

  countArray(): number[] {
    return Array.from({ length: this.count() }, (_, i) => i);
  }
}

