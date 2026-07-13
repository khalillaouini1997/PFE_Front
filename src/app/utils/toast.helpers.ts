import {Observable, tap} from 'rxjs';
import {ToastrService} from 'ngx-toastr';
import {TranslateService} from '@ngx-translate/core';

export function withToast<T>(
  obs$: Observable<T>,
  toastr: ToastrService,
  translate: TranslateService,
  successKey: string,
  errorKey: string = 'COMMON.ERROR'
): Observable<T> {
  return obs$.pipe(
    tap({
      next: () => toastr.success(translate.instant(successKey), translate.instant('COMMON.SUCCESS')),
      error: () => toastr.error(translate.instant(errorKey), translate.instant('COMMON.ERROR'))
    })
  );
}
