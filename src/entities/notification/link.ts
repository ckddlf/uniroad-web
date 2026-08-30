import type { NotificationResponse } from '@/shared/api/types';

/**
 * 알림 종류별 이동 경로.
 * 현재 서버가 실제로 만드는 알림은 CHAT과 NOTICE 두 가지뿐이고,
 * 나머지는 enum에만 있어 추정으로 연결한다.
 */
export function notificationHref(notification: NotificationResponse): string | null {
  const reference = notification.referenceId;

  switch (notification.type) {
    case 'CHAT': {
      const roomId = notification.roomId ?? reference;
      return roomId ? `/chat/${roomId}` : null;
    }
    case 'NOTICE':
      return reference ? `/notices/${reference}` : null;
    case 'LIKE':
      return reference ? `/community/${reference}` : null;
    case 'MATCH':
      // TODO(api): MATCH 알림이 동행 글을 가리키는지 확인 필요
      return reference ? `/companions/${reference}` : null;
    case 'SYSTEM':
      // 인증 심사 결과 안내로 쓰일 것을 전제로 인증 화면에 연결한다
      return '/verification';
    default:
      return null;
  }
}
