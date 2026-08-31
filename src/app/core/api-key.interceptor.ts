import { HttpInterceptorFn } from '@angular/common/http';
import { API_BASE, API_KEY, API_KEY_HEADER } from './api.config';

export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(API_BASE)) {
    return next(req);
  }

  const isHealth = req.url.startsWith(`${API_BASE}/api/health`);

  return next(
    req.clone({
      withCredentials: true,
      setHeaders: isHealth ? {} : { [API_KEY_HEADER]: API_KEY },
    }),
  );
};
