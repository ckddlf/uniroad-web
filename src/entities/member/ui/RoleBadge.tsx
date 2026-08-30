import { BadgeCheck } from 'lucide-react';

import type { Role } from '@/shared/api/types';
import { ROLE } from '@/shared/lib/constants';
import { Badge } from '@/shared/ui';

/**
 * 회원 등급 뱃지.
 * 게시글·거래글 응답에는 작성자 role이 없어, role을 실제로 아는 화면
 * (마이페이지·관리자 콘솔)에서만 쓸 수 있다.
 */
export function RoleBadge({ role }: { role: Role }) {
  if (role === 'ADMIN') return <Badge tone="purple">{ROLE.ADMIN}</Badge>;

  if (role === 'VERIFIED') {
    return (
      <Badge tone="brand" icon={<BadgeCheck aria-hidden className="size-3.5" />}>
        인증
      </Badge>
    );
  }

  return <Badge tone="neutral">{ROLE.USER}</Badge>;
}
