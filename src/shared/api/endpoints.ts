/**
 * 호출이 허용된 엔드포인트 목록. 이 파일에 없는 경로는 호출하지 않는다.
 * baseURL(`NEXT_PUBLIC_API_BASE_URL`)은 client.ts에서 붙으므로 여기에는 경로만 둔다.
 */
export const endpoints = {
  auth: {
    signUp: '/api/auth/sign-up',
    login: '/api/auth/login',
    reissue: '/api/auth/reissue',
    logout: '/api/auth/logout',
    onboarding: '/api/auth/onboarding',
    checkUsername: '/api/auth/check-username',
    checkEmail: '/api/auth/check-email',
  },

  member: {
    me: '/api/members/me',
    profile: '/api/members/me/profile',
    password: '/api/members/me/password',
  },

  verification: {
    root: '/api/v1/verifications',
    me: '/api/v1/verifications/me',
    pending: '/api/v1/verifications/pending',
    approve: (id: number) => `/api/v1/verifications/${id}/approve`,
    reject: (id: number) => `/api/v1/verifications/${id}/reject`,
    approved: '/api/admin/verifications/approved',
    rejected: '/api/admin/verifications/rejected',
  },

  s3: {
    presignedUrl: '/api/s3/presigned-url',
    verificationPresignedUrl: '/api/s3/exchange-verification/presigned-url',
    verificationReadUrl: '/api/s3/exchange-verification/read-url',
  },

  country: {
    list: '/api/countries',
  },

  freePost: {
    list: '/api/community/free-posts',
    search: '/api/community/free-posts/search',
    preDispatch: '/api/community/free-posts/pre-dispatch',
    preDispatchSearch: '/api/community/free-posts/pre-dispatch/search',
    dispatched: '/api/community/free-posts/dispatched',
    dispatchedSearch: '/api/community/free-posts/dispatched/search',
    popular: '/api/community/free-posts/popular',
    my: '/api/community/free-posts/my',
    liked: '/api/community/free-posts/liked',
    scraps: '/api/community/free-posts/scraps',
    detail: (postId: number) => `/api/community/free-posts/${postId}`,
    create: '/api/community/free-posts',
    like: (postId: number) => `/api/community/free-posts/${postId}/like`,
    scrap: (postId: number) => `/api/community/free-posts/${postId}/scrap`,
    comments: (postId: number) => `/api/community/free-posts/${postId}/comments`,
    comment: (postId: number, commentId: number) =>
      `/api/community/free-posts/${postId}/comments/${commentId}`,
  },

  usedItem: {
    list: '/api/used-items',
    search: '/api/used-items/search',
    my: '/api/used-items/my',
    scraps: '/api/used-items/scraps',
    detail: (id: number) => `/api/used-items/${id}`,
    create: '/api/used-items',
    scrap: (id: number) => `/api/used-items/${id}/scrap`,
    complete: (id: number) => `/api/used-items/${id}/complete`,
    reopen: (id: number) => `/api/used-items/${id}/reopen`,
  },

  ticket: {
    list: '/api/tickets',
    search: '/api/tickets/search',
    my: '/api/tickets/my',
    scraps: '/api/tickets/scraps',
    detail: (id: number) => `/api/tickets/${id}`,
    create: '/api/tickets',
    scrap: (id: number) => `/api/tickets/${id}/scrap`,
    complete: (id: number) => `/api/tickets/${id}/complete`,
  },

  companion: {
    list: '/api/companions',
    search: '/api/companions/search',
    my: '/api/companions/my',
    scraps: '/api/companions/scraps',
    detail: (postId: number) => `/api/companions/${postId}`,
    create: '/api/companions',
    scrap: (postId: number) => `/api/companions/${postId}/scrap`,
    complete: (postId: number) => `/api/companions/${postId}/complete`,
  },

  schedule: {
    exchangeInfo: '/api/my-university/exchange-info',
    document: (documentId: number) =>
      `/api/my-university/exchange-info/documents/${documentId}`,
  },

  accountBook: {
    root: '/api/account-book',
    balance: '/api/account-book/balance',
    summary: '/api/account-book/summary',
    daily: '/api/account-book/daily',
  },

  chat: {
    rooms: '/api/v1/chat/rooms',
    messages: (roomId: number) => `/api/v1/chat/rooms/${roomId}/messages`,
    read: (roomId: number) => `/api/v1/chat/rooms/${roomId}/read`,
    leave: (roomId: number) => `/api/v1/chat/rooms/${roomId}/members/me`,
  },

  /** 알림은 /notifications 와 /api/v1/notifications 두 벌이 있으나 v1만 사용한다 */
  notification: {
    all: '/api/v1/notifications/all',
    unread: '/api/v1/notifications/unread',
    unreadCount: '/api/v1/notifications/unread-count',
    read: (id: number) => `/api/v1/notifications/${id}/read`,
    readAll: '/api/v1/notifications/read-all',
    remove: (id: number) => `/api/v1/notifications/${id}`,
    removeAll: '/api/v1/notifications',
  },

  notice: {
    list: '/api/notices',
    detail: (noticeId: number) => `/api/notices/${noticeId}`,
    create: '/api/notices',
    update: (noticeId: number) => `/api/notices/${noticeId}`,
    remove: (noticeId: number) => `/api/admin/notices/${noticeId}`,
  },

  report: {
    create: '/api/reports',
  },

  admin: {
    dashboard: '/api/admin/dashboard',
    members: '/api/admin/members',
    memberRole: (memberId: number) => `/api/admin/members/${memberId}/role`,
    member: (memberId: number) => `/api/admin/members/${memberId}`,
    reports: '/api/admin/reports',
    report: (id: number) => `/api/admin/reports/${id}`,
  },
} as const;
