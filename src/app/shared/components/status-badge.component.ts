import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentStatus, PaidStatus } from '../models';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-xs select-none"
      [ngClass]="badgeClass()"
    >
      <span class="w-1.5 h-1.5 rounded-full" [ngClass]="dotClass()"></span>
      {{ label() }}
    </span>
  `
})
export class StatusBadgeComponent {
  status = input<AppointmentStatus | PaidStatus | string>('Confirmed');
  type = input<'appointment' | 'payment' | 'active' | 'custom'>('appointment');

  badgeClass(): string {
    const s = this.status();
    switch (s) {
      case 'Arrived':
      case 'حضر':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Confirmed':
      case 'مؤكد':
      case 'في الانتظار':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Late':
      case 'متأخر':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Completed':
      case 'مكتملة':
      case 'مكتمل':
      case 'تم الكشف':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelled':
      case 'ملغاة':
      case 'ملغي':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'NotSeen':
      case 'لم يتم الكشف':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'Paid':
      case 'مدفوع':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Unpaid':
      case 'غير مدفوع':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'نشط':
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'معطل':
      case 'Inactive':
        return 'bg-slate-100 text-slate-600 border-slate-300';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }

  dotClass(): string {
    const s = this.status();
    switch (s) {
      case 'Arrived':
        return 'bg-blue-500 animate-pulse';
      case 'Confirmed':
        return 'bg-amber-500';
      case 'Late':
        return 'bg-orange-500';
      case 'Completed':
      case 'Paid':
      case 'Active':
      case 'نشط':
        return 'bg-emerald-500';
      case 'Cancelled':
      case 'Unpaid':
        return 'bg-rose-500';
      case 'NotSeen':
      case 'Inactive':
      case 'معطل':
        return 'bg-slate-400';
      default:
        return 'bg-gray-400';
    }
  }

  label(): string {
    const s = this.status();
    switch (s) {
      case 'Arrived':
        return 'حضر بالعيادة';
      case 'Confirmed':
        return 'في الانتظار';
      case 'Late':
        return 'متأخر';
      case 'Completed':
        return 'مكتمل';
      case 'Cancelled':
        return 'ملغي';
      case 'NotSeen':
        return 'لم يتم الكشف';
      case 'Paid':
        return 'مدفوع';
      case 'Unpaid':
        return 'غير مدفوع';
      case 'Active':
        return 'نشط';
      case 'Inactive':
        return 'معطل';
      default:
        return s;
    }
  }
}

