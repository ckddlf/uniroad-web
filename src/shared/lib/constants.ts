import type {
  AccountCategory,
  AccountType,
  CompanionStatus,
  CurrentSituation,
  Gender,
  NotificationType,
  ReportReason,
  ReportStatus,
  ReportTargetType,
  Role,
  TicketStatus,
  TicketType,
  TradeCategory,
  UsedItemStatus,
  VerificationStatus,
} from '@/shared/api/types';

/** 사용자에게 보이는 문구에는 영문 enum 값을 그대로 쓰지 않는다 */

export const CURRENT_SITUATION: Record<CurrentSituation, string> = {
  PREPARING_APPLICATION: '지원 준비중',
  PREPARING_DEPARTURE: '출국 준비중',
  DISPATCHED: '파견 중',
};

export const CURRENT_SITUATION_DESCRIPTION: Record<CurrentSituation, string> = {
  PREPARING_APPLICATION: '학교 선발 과정을 준비 중이에요',
  PREPARING_DEPARTURE: '합격 후 출국을 준비 중이에요',
  DISPATCHED: '현지에서 생활 중이에요',
};

export const GENDER: Record<Gender, string> = {
  MALE: '남성',
  FEMALE: '여성',
};

export const ROLE: Record<Role, string> = {
  USER: '일반',
  VERIFIED: '교환학생 인증',
  ADMIN: '운영자',
};

export const VERIFICATION_STATUS: Record<VerificationStatus, string> = {
  PENDING: '검토중',
  APPROVED: '승인',
  REJECTED: '거절',
};

export const TRADE_CATEGORY: Record<TradeCategory, string> = {
  KITCHEN: '주방',
  BATH: '욕실',
  LIFE: '생활',
  BEDDING: '침구',
  ELECTRONICS: '전자기기',
  ETC: '기타',
};

export const TRADE_CATEGORY_ORDER: TradeCategory[] = [
  'KITCHEN',
  'BATH',
  'LIFE',
  'BEDDING',
  'ELECTRONICS',
  'ETC',
];

/** 응답 DTO에는 없고 검색 필터로만 쓸 수 있다 */
export const USED_ITEM_STATUS: Record<UsedItemStatus, string> = {
  SELLING: '판매중',
  RESERVED: '예약중',
  SOLD: '판매완료',
};

export const TICKET_TYPE: Record<TicketType, string> = {
  TOUR: '투어·입장권',
  CONCERT: '공연',
  TRAIN: '기차',
  FLIGHT: '항공',
  ACCOMMODATION: '숙소',
  ETC: '기타',
};

export const TICKET_TYPE_ORDER: TicketType[] = [
  'TOUR',
  'CONCERT',
  'TRAIN',
  'FLIGHT',
  'ACCOMMODATION',
  'ETC',
];

export const TICKET_STATUS: Record<TicketStatus, string> = {
  AVAILABLE: '양도 가능',
  COMPLETED: '양도 완료',
};

export const COMPANION_STATUS: Record<CompanionStatus, string> = {
  RECRUITING: '모집중',
  COMPLETED: '모집완료',
};

export const ACCOUNT_TYPE: Record<AccountType, string> = {
  INCOME: '충전',
  EXPENSE: '지출',
};

export const ACCOUNT_CATEGORY: Record<AccountCategory, string> = {
  FOOD: '식비',
  TRANSPORT: '교통',
  SHOPPING: '쇼핑',
  TRAVEL: '여행',
  ETC: '기타',
  CHARGE: '충전',
};

export const REPORT_TARGET: Record<ReportTargetType, string> = {
  FREE_POST: '자유게시판',
  USED_ITEM: '중고거래',
  TICKET_TRANSFER: '티켓 양도',
  COMPANION: '동행',
  MEMBER: '회원',
};

export const REPORT_REASON: Record<ReportReason, string> = {
  SPAM: '스팸·광고',
  ABUSE: '욕설·비방',
  FRAUD: '사기 의심',
  INAPPROPRIATE: '부적절한 내용',
  ETC: '기타',
};

export const REPORT_STATUS: Record<ReportStatus, string> = {
  PENDING: '접수',
  IN_PROGRESS: '처리중',
  RESOLVED: '완료',
  REJECTED: '반려',
};

export const NOTIFICATION_TYPE: Record<NotificationType, string> = {
  CHAT: '채팅',
  MATCH: '동행',
  LIKE: '좋아요',
  NOTICE: '공지',
  SYSTEM: '시스템',
};

/** 파견 학기 — 서버는 자유 문자열을 받지만 입력은 목록으로 고정한다 */
export const DISPATCH_SEMESTERS = ['1학기', '2학기', '여름학기', '겨울학기'] as const;

/**
 * 파견 국가 선택지로 쓰는 유럽 국가 목록 (가나다순).
 * 서버의 국가 목록(`/api/countries`)이 비어 있을 때 이 목록을 쓴다.
 * 여기에 없는 나라는 "직접 입력"으로 적을 수 있다.
 */
export const EUROPEAN_COUNTRIES = [
  '그리스',
  '네덜란드',
  '노르웨이',
  '덴마크',
  '독일',
  '라트비아',
  '루마니아',
  '룩셈부르크',
  '리투아니아',
  '몰타',
  '벨기에',
  '불가리아',
  '스웨덴',
  '스위스',
  '스페인',
  '슬로바키아',
  '슬로베니아',
  '아이슬란드',
  '아일랜드',
  '에스토니아',
  '영국',
  '오스트리아',
  '이탈리아',
  '체코',
  '크로아티아',
  '키프로스',
  '포르투갈',
  '폴란드',
  '프랑스',
  '핀란드',
  '헝가리',
] as const;

/**
 * 온보딩 출생 연도 선택지 (최근 연도부터).
 * 만 18~40세에 해당하는 범위이고, 벗어나는 경우 "직접 입력"으로 적는다.
 */
export const BIRTH_YEAR_OPTIONS = Array.from({ length: 23 }, (_, index) =>
  String(new Date().getFullYear() - 18 - index),
);

/** 커서 페이징 기본 크기 */
export const DEFAULT_PAGE_SIZE = 10;

/** 업로드 제한 */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ALLOWED_UPLOAD_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'pdf'] as const;
export const MAX_IMAGE_EDGE = 1920;
