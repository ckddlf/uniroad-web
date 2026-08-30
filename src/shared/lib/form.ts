import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

import { isApiError } from '@/shared/api/errors';

/**
 * 400 응답의 필드별 메시지를 폼 에러로 옮긴다.
 * 폼에 없는 필드가 오면 매핑하지 못하므로, 남은 메시지는 호출부가 토스트로 보여준다.
 *
 * @returns 폼 필드로 매핑된 항목이 하나라도 있으면 true
 */
export function applyServerFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): boolean {
  if (!isApiError(error) || !error.fieldErrors) return false;

  let matched = false;
  for (const [field, message] of Object.entries(error.fieldErrors)) {
    if (!fields.includes(field as Path<T>)) continue;
    setError(field as Path<T>, { type: 'server', message });
    matched = true;
  }

  return matched;
}
