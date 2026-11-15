import { HttpInterceptorFn } from '@angular/common/http';

export const correlationInterceptor: HttpInterceptorFn = (req, next) => {
  const correlationId = 'CF-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7);

  const cloned = req.clone({
    setHeaders: {
      'X-Correlation-Id': correlationId
    }
  });

  return next(cloned);
};

