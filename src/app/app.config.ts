import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideEchartsCore } from 'ngx-echarts';

import { routes } from './app.routes';
import { correlationInterceptor } from './core/interceptors/correlation.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { mockDevInterceptor } from './core/interceptors/mock-dev.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        correlationInterceptor,
        authInterceptor,
        errorInterceptor,
        mockDevInterceptor
      ])
    ),
    provideEchartsCore({
      echarts: () => import('echarts')
    })
  ]
};
