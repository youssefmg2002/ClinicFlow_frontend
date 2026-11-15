import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../services/toast.service';
import { ApiErrorResponse } from '../../shared/models';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let friendlyMessage = 'حدث خطأ غير متوقع أثناء معالجة الطلب.';

      if (error.error && typeof error.error === 'object') {
        const apiError = error.error as ApiErrorResponse;
        if (apiError.message) {
          friendlyMessage = apiError.message;
        }
      }

      if (error.status === 0) {
        friendlyMessage = 'تعذر الاتصال بخادم النظام (Backend). يرجى التأكد من تشغيل الخادم وتوافر اتصال مستقر بالشبكة.';
        toastService.error(friendlyMessage, 'فشل الاتصال بالخادم');
      } else if (error.status === 401) {
        // Unauthorized
        if (!req.url.includes('/auth/login') && !req.url.includes('/super-admin/auth/login')) {
          toastService.error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً.', 'جلسة منتهية');
          authService.logout();
        }
      } else if (error.status === 403) {
        toastService.error(friendlyMessage !== 'حدث خطأ غير متوقع أثناء معالجة الطلب.' ? friendlyMessage : 'ليس لديك الصلاحية للوصول إلى هذا المورد أو تنفيذ هذا الإجراء.', 'غير مصرح');
      } else if (error.status === 423) {
        toastService.error('تم قفل الحساب مؤقتاً بسبب تكرار المحاولات غير الصحيحة. يرجى المحاولة لاحقاً.', 'حساب موقوف');
      } else if (error.status === 409) {
        toastService.warning(friendlyMessage, 'تعارض في البيانات');
      } else if (error.status === 400) {
        toastService.error(friendlyMessage, 'بيانات غير صحيحة');
      } else if (error.status === 500) {
        toastService.error('حدث خطأ في الخادم، يرجى المحاولة لاحقاً.', 'خطأ بالخادم');
      }

      return throwError(() => error);
    })
  );
};

