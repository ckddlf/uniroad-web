import type { ApiResponse } from './types';

/**
 * Chat·Notification 계열은 ApiResponse 래핑 없이 원시 객체를 반환한다.
 * 래핑 여부를 런타임에 판별해 꺼낸다.
 */
export function unwrap<T>(body: unknown): T {
  if (
    body !== null &&
    typeof body === 'object' &&
    'data' in body &&
    'status' in body &&
    'timestamp' in body
  ) {
    return (body as ApiResponse<T>).data;
  }
  return body as T;
}
