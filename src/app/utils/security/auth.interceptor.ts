import {HttpInterceptorFn} from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Add withCredentials to ensure cookies are sent with requests
  const authReq = req.clone({
    withCredentials: true
  });
  return next(authReq);
};
