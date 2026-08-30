import type { ApiErrorBody } from './types';

export type ApiErrorKind = 'network' | 'timeout' | 'http' | 'unknown';

const STATUS_MESSAGE: Record<number, string> = {
  400: '입력한 내용을 다시 확인해주세요.',
  401: '로그인이 필요합니다.',
  403: '권한이 없습니다.',
  404: '요청한 정보를 찾을 수 없습니다.',
  409: '이미 처리된 요청입니다.',
  413: '파일 용량이 너무 큽니다.',
  429: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
};

const FALLBACK_MESSAGE = '일시적인 오류입니다. 잠시 후 다시 시도해주세요.';
const NETWORK_MESSAGE = '네트워크에 연결할 수 없습니다. 연결 상태를 확인해주세요.';

/** 화면에서 다루기 쉬운 형태로 정규화한 API 에러 */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | null;
  readonly code: string | null;
  readonly body: unknown;
  /** 400 검증 실패 시 서버가 내려주는 필드별 메시지 */
  readonly fieldErrors: Record<string, string> | null;

  constructor(params: {
    message: string;
    kind: ApiErrorKind;
    status?: number | null;
    code?: string | null;
    body?: unknown;
    fieldErrors?: Record<string, string> | null;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.kind = params.kind;
    this.status = params.status ?? null;
    this.code = params.code ?? null;
    this.body = params.body ?? null;
    this.fieldErrors = params.fieldErrors ?? null;
  }

  get isNetwork(): boolean {
    return this.kind === 'network' || this.kind === 'timeout';
  }

  get isServer(): boolean {
    return this.status !== null && this.status >= 500;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** 서버가 내려준 에러 본문에서 message/code를 최대한 방어적으로 꺼낸다 */
export function readErrorBody(body: unknown): ApiErrorBody {
  if (!isRecord(body)) return {};
  const message = typeof body.message === 'string' ? body.message : undefined;
  const code = typeof body.code === 'string' ? body.code : undefined;
  const status = typeof body.status === 'number' ? body.status : undefined;
  return { message, code, status, errors: readFieldErrors(body.errors) };
}

/** { password: "비밀번호는 8~20자여야 합니다." } 형태만 통과시킨다 */
function readFieldErrors(value: unknown): Record<string, string> | null {
  if (!isRecord(value)) return null;

  const entries = Object.entries(value).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string',
  );
  return entries.length > 0 ? Object.fromEntries(entries) : null;
}

export function messageForStatus(status: number | null | undefined): string {
  if (status == null) return FALLBACK_MESSAGE;
  return STATUS_MESSAGE[status] ?? FALLBACK_MESSAGE;
}

export function networkErrorMessage(): string {
  return NETWORK_MESSAGE;
}

/** 어떤 값이든 사용자에게 보여줄 한 줄 메시지로 변환한다 */
export function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return FALLBACK_MESSAGE;
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
