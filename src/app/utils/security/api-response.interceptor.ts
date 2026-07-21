import {HttpEvent, HttpInterceptorFn, HttpResponse} from '@angular/common/http';
import {map} from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
  error?: string;
}

export const apiResponseInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        // Skip for auth endpoints (return raw Map<String, Object>)
        if (req.url.includes('/authenticate') || req.url.includes('/refresh')) {
          return event;
        }

        const body = event.body;
        if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
          const apiResponse = body as ApiResponse<any>;

          if (!apiResponse.success) {
            throw new Error(apiResponse.message || apiResponse.error || 'Request failed');
          }

          return event.clone({body: apiResponse.data});
        }
      }
      return event;
    })
  );
};
