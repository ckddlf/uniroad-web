/**
 * 백엔드 OpenAPI(http://api.uniroad.kr/v3/api-docs) 스키마를 그대로 옮긴 타입.
 * 도메인 로직용 타입은 entities/ 에서 별도로 정의하고 매퍼로 변환한다.
 * nullable 표기는 스키마에 명시되어 있지 않아 실제 응답 기준으로 추정한 값이므로
 * 렌더링 시 항상 옵셔널 체이닝과 폴백을 사용할 것.
 */

/* ─────────── 공통 ─────────── */
export interface ApiResponse<T> {
  timestamp: string;
  status: number;
  message: string;
  data: T;
}

/** 서버 에러 응답 (인증 실패 등은 ApiResponse 래퍼가 아니라 이 형태로 온다) */
export interface ApiErrorBody {
  status?: number;
  code?: string;
  message?: string;
  timestamp?: string;
  /** 400 검증 실패일 때만 채워진다: { password: "비밀번호는 8~20자여야 합니다." } */
  errors?: Record<string, string> | null;
}

/** 커서 페이징 (자유게시판·중고거래·티켓·동행) */
export interface CursorPage<T> {
  items: T[];
  nextCursorId: number | null;
  hasNext: boolean;
}

/** 오프셋 페이징 (알림) — Spring Page */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  sort: SortObject[];
  pageable: PageableObject;
}

export interface SortObject {
  direction: string;
  nullHandling: string;
  ascending: boolean;
  property: string;
  ignoreCase: boolean;
}

export interface PageableObject {
  unpaged: boolean;
  paged: boolean;
  pageNumber: number;
  pageSize: number;
  offset: number;
  sort: SortObject[];
}

/** 쿼리스트링으로 평탄화해 전송: ?page=0&size=20&sort=createdAt,desc */
export interface PageableParams {
  page?: number;
  size?: number;
  sort?: string[];
}

/* ─────────── Enum ─────────── */
export type MemberStatus = 'NEED_SIGNUP' | 'NEED_ONBOARDING' | 'ACTIVE';
export type Role = 'USER' | 'VERIFIED' | 'ADMIN';
export type Gender = 'MALE' | 'FEMALE';
export type CurrentSituation = 'PREPARING_APPLICATION' | 'PREPARING_DEPARTURE' | 'DISPATCHED';
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type TradeCategory = 'KITCHEN' | 'BATH' | 'LIFE' | 'BEDDING' | 'ELECTRONICS' | 'ETC';
/** 서버 enum은 SELLING/RESERVED/SOLD 세 가지지만 RESERVED로 바꾸는 API는 없다 */
export type UsedItemStatus = 'SELLING' | 'RESERVED' | 'SOLD';
export type TicketType = 'TOUR' | 'CONCERT' | 'TRAIN' | 'FLIGHT' | 'ACCOMMODATION' | 'ETC';
export type TicketStatus = 'AVAILABLE' | 'COMPLETED';
export type CompanionStatus = 'RECRUITING' | 'COMPLETED';
export type AccountType = 'INCOME' | 'EXPENSE';
export type AccountCategory = 'FOOD' | 'TRANSPORT' | 'SHOPPING' | 'TRAVEL' | 'ETC' | 'CHARGE';
export type ReportTargetType =
  | 'FREE_POST'
  | 'USED_ITEM'
  | 'TICKET_TRANSFER'
  | 'COMPANION'
  | 'MEMBER';
export type ReportReason = 'SPAM' | 'ABUSE' | 'FRAUD' | 'INAPPROPRIATE' | 'ETC';
export type ReportStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
export type ChatRefType = 'TRADE' | 'TICKET' | 'MENTOR';
export type ChatMessageType = 'TALK' | 'ENTER' | 'QUIT';
export type NotificationType = 'CHAT' | 'MATCH' | 'LIKE' | 'NOTICE' | 'SYSTEM';

/* ─────────── Auth ─────────── */
export interface SignUpRequest {
  username: string;
  name: string;
  password: string;
  email?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ReissueRequest {
  refreshToken: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  accessTokenExpiresIn: number;
  status: MemberStatus;
  role: Role;
}

export interface OnboardingRequest {
  nickname: string;
  gender: Gender;
  currentSituation: CurrentSituation;
  domesticUniversity: string;
  birthYear?: number;
  dispatchedUniversity?: string;
  dispatchedCountry?: string;
  dispatchedRegion?: string;
  dispatchYear?: number;
  dispatchSemester?: string;
  applicationDeadline?: string;
  departureDate?: string;
  dispatchStartDate?: string;
  returnDate?: string;
}

/* ─────────── Member ─────────── */
export interface MemberResponseDto {
  id: number;
  username: string;
  email: string | null;
  name: string;
  nickname: string | null;
  gender: Gender | null;
  currentSituation: CurrentSituation | null;
  birthYear: number | null;
  domesticUniversityId: number | null;
  domesticUniversity: string | null;
  homeUniversity: string | null;
  dispatchedUniversity: string | null;
  dispatchedCountry: string | null;
  dispatchedRegion: string | null;
  dispatchYear: number | null;
  dispatchSemester: string | null;
  applicationDeadline: string | null;
  departureDate: string | null;
  dispatchStartDate: string | null;
  returnDate: string | null;
  role: Role;
  status: MemberStatus;
  balance: number | null;
}

export interface MemberProfileUpdateRequest {
  currentSituation?: CurrentSituation;
  nickname?: string;
  dispatchedUniversity?: string;
  dispatchedCountry?: string;
  dispatchedRegion?: string;
  domesticUniversity?: string;
  dispatchYear?: number;
  dispatchSemester?: string;
  applicationDeadline?: string;
  departureDate?: string;
  dispatchStartDate?: string;
  returnDate?: string;
}

export interface PasswordUpdateRequest {
  newPassword: string;
}

/* ─────────── Verification ─────────── */
export interface VerificationRequest {
  /** presigned 응답의 fileUrl (key 아님) */
  imageUrl: string;
}

export interface VerificationResponse {
  id: number;
  imageUrl: string;
  status: VerificationStatus;
  rejectReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
}

export interface AdminVerificationResponse {
  memberId: number;
  memberName: string;
  memberEmail: string;
  verification: VerificationResponse;
}

export interface RejectRequest {
  reason: string;
}

/* ─────────── S3 ─────────── */
export interface PresignedUrlRequestDto {
  fileName: string;
  contentType: string;
  fileType: string;
}

export interface PresignedUrlResponseDto {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}

export interface PrivatePresignedUrlRequestDto {
  key: string;
}

export interface PrivatePresignedUrlResponseDto {
  downloadUrl: string;
}

/* ─────────── Country ─────────── */
export interface CountryResponse {
  id: number;
  code: string;
  name: string;
}

/* ─────────── FreePost ─────────── */
export interface FreePostRequest {
  title: string;
  content: string;
  imageUrls?: string[];
}

export interface FreePostSummaryResponse {
  id: number;
  title: string;
  preview: string;
  country: string | null;
  status: string | null;
  authorName: string;
  authorNickname: string | null;
  likeCount: number;
  scrapCount: number;
  commentCount: number;
  thumbnailImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FreePostCommentResponse {
  id: number;
  authorName: string;
  content: string;
  createdAt: string;
  mine: boolean;
}

export interface FreePostDetailResponse {
  id: number;
  title: string;
  content: string;
  country: string | null;
  status: string | null;
  authorName: string;
  authorNickname: string | null;
  imageUrls: string[];
  likeCount: number;
  scrapCount: number;
  commentCount: number;
  liked: boolean;
  mine: boolean;
  createdAt: string;
  updatedAt: string;
  /** 별도 댓글 조회 API가 없어 상세 응답에 포함된다 */
  comments: FreePostCommentResponse[];
}

export interface FreePostLikeResponse {
  liked: boolean;
  likeCount: number;
}

export interface FreePostCommentRequest {
  content: string;
}

/* ─────────── UsedItem ─────────── */
export interface TradeItemDto {
  category: TradeCategory;
  name: string;
  quantity: number;
}

export interface TradeCategoryImageDto {
  category: TradeCategory;
  imageUrl: string;
}

export interface UsedItemRequestDto {
  title: string;
  content: string;
  price: number;
  region: string;
  semester: string;
  country: string;
  thumbnailImageUrl: string;
  status?: UsedItemStatus;
  items?: TradeItemDto[];
  categoryImages?: TradeCategoryImageDto[];
}

export interface UsedItemSummaryResponseDto {
  id: number;
  title: string;
  price: number;
  region: string;
  semester: string;
  country: string;
  scrapCount: number;
  thumbnailImageUrl: string | null;
  authorName: string;
  authorNickname: string | null;
  authorDispatchedCountry: string | null;
  authorDispatchedRegion: string | null;
  authorDispatchedUniversity: string | null;
  authorDispatchYear: number | null;
  authorDispatchSemester: string | null;
  authorDispatchStartDate: string | null;
  updatedAt: string;
  /** 구버전 서버에서는 내려오지 않을 수 있다 */
  status?: UsedItemStatus;
}

export interface UsedItemResponseDto extends Omit<UsedItemSummaryResponseDto, 'updatedAt'> {
  content: string;
  /** 채팅방 생성 시 targetMemberId 로 사용 */
  memberId: number;
  items: TradeItemDto[];
  categoryImages: TradeCategoryImageDto[];
  createdAt: string;
  updatedAt: string;
}

/* ─────────── Ticket Transfer ─────────── */
export interface TicketTransferRequestDto {
  ticketType: TicketType;
  title: string;
  quantity: number;
  transferPrice: number;
  customTicketType?: string;
  content?: string;
  country?: string;
  originalPrice?: number;
  /* TOUR */
  useDate?: string;
  useTime?: string;
  placeName?: string;
  /* CONCERT */
  performanceDate?: string;
  performanceTime?: string;
  performancePlace?: string;
  /* TRAIN / FLIGHT */
  departureDate?: string;
  departureTime?: string;
  departureStation?: string;
  arrivalStation?: string;
  departureAirport?: string;
  arrivalAirport?: string;
  /* ACCOMMODATION */
  checkInDate?: string;
  checkOutDate?: string;
  accommodationName?: string;
}

export interface TicketTransferResponseDto extends TicketTransferRequestDto {
  id: number;
  /** 작성자 회원 ID — 채팅방 생성(targetMemberId)과 본인 여부 판단에 쓴다. 구버전 서버에서는 없다. */
  memberId?: number;
  authorName: string;
  authorNickname: string | null;
  authorDispatchedCountry: string | null;
  authorDispatchedRegion: string | null;
  authorDispatchedUniversity: string | null;
  authorDispatchYear: number | null;
  authorDispatchSemester: string | null;
  authorDispatchStartDate: string | null;
  scrapCount: number;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
}

/* ─────────── Companion ─────────── */
export interface CompanionPostRequest {
  title: string;
  content: string;
  startDate: string;
  endDate: string;
  country: string;
  region: string;
  /** 카카오 오픈채팅 URL */
  chatLink: string;
  status: CompanionStatus;
  capacity: number;
  currentParticipants: number;
  genderRatio?: string;
}

export interface CompanionPostResponse extends CompanionPostRequest {
  id: number;
  /** 구버전 서버에서는 내려오지 않을 수 있다 */
  memberId?: number;
  memberName: string;
  statusDescription: string;
  scrapCount: number;
  createdAt: string;
  updatedAt: string;
}

/* ─────────── Schedule (내 학교 교환 정보) ─────────── */
export interface ScheduleResponse {
  title: string;
  period: string;
}

export interface DocumentCheckResponse {
  id: number;
  text: string;
  checkedByMe: boolean;
}

export interface MyUniversityExchangeInfoResponse {
  universityName: string;
  officeName: string | null;
  phone: string | null;
  email: string | null;
  eligibility: string[];
  schedules: ScheduleResponse[];
  requiredDocuments: DocumentCheckResponse[];
  /** Phase 2 — 파싱만 하고 렌더링하지 않는다 */
  partnerSchools: unknown[];
  tips: unknown[];
  blogLinks: unknown[];
}

export interface DocumentCheckRequest {
  checked: boolean;
}

/* ─────────── AccountBook ─────────── */
export interface AccountBookRequest {
  amount: number;
  type: AccountType;
  category: AccountCategory;
  title: string;
  transactionDate: string;
  description?: string;
}

export interface AccountBookResponse {
  id: number;
  amount: number;
  type: AccountType;
  category: AccountCategory;
  categoryName: string;
  title: string;
  description: string | null;
  transactionDate: string;
}

export interface DailySummary {
  income: number;
  expense: number;
}

export interface MonthlySummaryResponse {
  totalIncome: number;
  totalExpense: number;
  /** "2026-05-08" → { income, expense } */
  dailySummaries: Record<string, DailySummary>;
}

export interface BalanceResponse {
  balance: number;
}

/* ─────────── Chat  ※ ApiResponse 래핑 없음 ─────────── */
export interface ChatRoomRequest {
  referenceType: ChatRefType;
  referenceId: number;
  targetMemberId: number;
}

export interface ChatRoomResponse {
  roomId: number;
  referenceType: ChatRefType;
  referenceId: number;
  opponentMemberId: number;
  opponentName: string;
  opponentNickname: string | null;
  lastMessage: string | null;
  lastMessageType: ChatMessageType | null;
  lastMessageCreatedAt: string | null;
  unreadCount: number;
  lastReadAt: string | null;
}

export interface ChatMessageSendRequest {
  message: string;
  type: ChatMessageType;
}

export interface ChatMessageResponse {
  id: number;
  roomId: number;
  senderId: number;
  message: string;
  type: ChatMessageType;
  createdAt: string;
  read: boolean;
}

export interface ChatReadResponse {
  roomId: number;
  lastReadAt: string;
}

/* ─────────── Notification  ※ ApiResponse 래핑 없음 ─────────── */
export interface NotificationResponse {
  notificationId: number;
  type: NotificationType;
  read: boolean;
  title: string;
  content: string;
  referenceId: number | null;
  /** CHAT일 때 referenceId와 동일 */
  roomId: number | null;
  createdAt: string;
}

export interface UnreadCountResponse {
  count: number;
}

/* ─────────── Notice ─────────── */
export interface NoticeRequest {
  title: string;
  content: string;
}

export interface NoticeResponse {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/* ─────────── Blog ─────────── */
/** 에디터(ProseMirror) 원본. 서버는 들여다보지 않고 그대로 주고받는다. */
export type BlogContentJson = Record<string, unknown>;

export type BlogPostStatus = 'DRAFT' | 'PUBLISHED';

export interface BlogPostRequest {
  title: string;
  slug: string;
  summary: string;
  thumbnailUrl: string;
  contentJson: BlogContentJson;
  contentHtml: string;
  published: boolean;
}

export interface BlogPostSummaryResponse {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  thumbnailUrl: string | null;
  authorNickname: string | null;
  status: BlogPostStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  likeCount: number;
  likedByMe: boolean;
}

export interface BlogPostDetailResponse extends BlogPostSummaryResponse {
  contentHtml: string;
  /** 관리자 수정 화면에서만 채워진다 */
  contentJson: BlogContentJson | null;
}

export interface BlogPostLikeResponse {
  postId: number;
  liked: boolean;
  likeCount: number;
}

/* ─────────── Report ─────────── */
export interface ReportRequest {
  targetType: ReportTargetType;
  targetId: number;
  reason: ReportReason;
  detail?: string;
}

export interface ReportResponse {
  id: number;
  reporterId: number;
  reporterName: string;
  targetType: ReportTargetType;
  targetId: number;
  reason: ReportReason;
  detail: string | null;
  status: ReportStatus;
  adminMemo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminReportUpdateRequest {
  status: ReportStatus;
  adminMemo?: string;
}

/* ─────────── Admin ─────────── */
export interface AdminDashboardResponse {
  totalMembers: number;
  todaySignups: number;
  totalPosts: number;
  pendingVerifications: number;
  reportCount: number;
  resolvedReportCount: number;
  pendingReportCount: number;
}

export interface MemberRoleUpdateRequest {
  role: Role;
}
