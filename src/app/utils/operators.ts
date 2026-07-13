import {map, OperatorFunction} from 'rxjs';

export function unwrapResponse<T>(): OperatorFunction<any, T> {
  return map((res: any) => (res?.data ?? res) as T);
}
