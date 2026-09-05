/**
 * TanStack Query 키 팩토리.
 * 뮤테이션 후에는 전체 무효화 대신 여기서 만든 키로 정확히 invalidate 한다.
 */

/** 목록 필터는 형태가 도메인마다 달라 읽기 전용 객체면 무엇이든 받는다 */
type Filters = object | undefined;

export const queryKeys = {
  member: {
    me: () => ['member', 'me'] as const,
  },

  country: {
    list: () => ['country', 'list'] as const,
  },

  verification: {
    me: () => ['verification', 'me'] as const,
    pending: () => ['verification', 'pending'] as const,
    approved: () => ['verification', 'approved'] as const,
    rejected: () => ['verification', 'rejected'] as const,
  },

  community: {
    all: () => ['community'] as const,
    list: (tab: string, filters?: Filters) => ['community', 'list', tab, filters ?? {}] as const,
    popular: () => ['community', 'popular'] as const,
    my: () => ['community', 'my'] as const,
    liked: () => ['community', 'liked'] as const,
    scraps: () => ['community', 'scraps'] as const,
    detail: (postId: number) => ['community', 'detail', postId] as const,
  },

  usedItem: {
    all: () => ['usedItem'] as const,
    list: (filters?: Filters) => ['usedItem', 'list', filters ?? {}] as const,
    my: () => ['usedItem', 'my'] as const,
    scraps: () => ['usedItem', 'scraps'] as const,
    detail: (id: number) => ['usedItem', 'detail', id] as const,
  },

  ticket: {
    all: () => ['ticket'] as const,
    list: (filters?: Filters) => ['ticket', 'list', filters ?? {}] as const,
    my: () => ['ticket', 'my'] as const,
    scraps: () => ['ticket', 'scraps'] as const,
    detail: (id: number) => ['ticket', 'detail', id] as const,
  },

  companion: {
    all: () => ['companion'] as const,
    list: (filters?: Filters) => ['companion', 'list', filters ?? {}] as const,
    my: () => ['companion', 'my'] as const,
    scraps: () => ['companion', 'scraps'] as const,
    detail: (postId: number) => ['companion', 'detail', postId] as const,
  },

  schedule: {
    exchangeInfo: () => ['schedule', 'exchangeInfo'] as const,
  },

  accountBook: {
    all: () => ['accountBook'] as const,
    balance: () => ['accountBook', 'balance'] as const,
    summary: (year: number, month: number) => ['accountBook', 'summary', year, month] as const,
    daily: (date: string) => ['accountBook', 'daily', date] as const,
  },

  chat: {
    all: () => ['chat'] as const,
    rooms: () => ['chat', 'rooms'] as const,
    messages: (roomId: number) => ['chat', 'messages', roomId] as const,
  },

  notification: {
    all: () => ['notification'] as const,
    list: (scope: 'all' | 'unread') => ['notification', 'list', scope] as const,
    unreadCount: () => ['notification', 'unreadCount'] as const,
  },

  notice: {
    list: () => ['notice', 'list'] as const,
    detail: (noticeId: number) => ['notice', 'detail', noticeId] as const,
  },

  blog: {
    all: () => ['blog'] as const,
    list: () => ['blog', 'list'] as const,
    detail: (slug: string) => ['blog', 'detail', slug] as const,
    adminList: () => ['blog', 'admin', 'list'] as const,
    adminDetail: (postId: number) => ['blog', 'admin', 'detail', postId] as const,
  },

  admin: {
    dashboard: () => ['admin', 'dashboard'] as const,
    members: () => ['admin', 'members'] as const,
    reports: () => ['admin', 'reports'] as const,
  },
} as const;
