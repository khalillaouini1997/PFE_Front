import { HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';

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
        // Skip unwrapping for authentication endpoints to maintain compatibility
        // These endpoints return Map<String, Object> with user data directly
        if (req.url.includes('/authenticate') || req.url.includes('/refresh')) {
          return event;
        }

        // Check if the response has the ApiResponse structure
        const body = event.body;
        if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
          // Unwrap the ApiResponse and return only the data
          const apiResponse = body as ApiResponse<any>;
          
          // If success is false, throw an error
          if (!apiResponse.success) {
            throw new Error(apiResponse.message || apiResponse.error || 'Request failed');
          }
          
          // Return a new HttpResponse with unwrapped data
          return event.clone({ body: apiResponse.data });
        }
      }
      return event;
    })
  );
};
