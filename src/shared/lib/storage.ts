/**
 * 브라우저 저장소 접근을 한곳으로 모은다.
 * SSR(서버 렌더)에서는 window가 없으므로 모든 함수가 조용히 no-op으로 동작한다.
 */

const REFRESH_TOKEN_KEY = 'uniroad.refreshToken';
const REMEMBER_KEY = 'uniroad.rememberMe';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/** 사파리 프라이빗 모드 등에서 storage 접근 자체가 throw할 수 있어 감싼다 */
function safeGet(storage: Storage | null, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function safeSet(storage: Storage | null, key: string, value: string): void {
  try {
    storage?.setItem(key, value);
  } catch {
    /* 저장 실패는 무시한다 — 세션이 짧아질 뿐 기능은 동작한다 */
  }
}

function safeRemove(storage: Storage | null, key: string): void {
  try {
    storage?.removeItem(key);
  } catch {
    /* 무시 */
  }
}

function local(): Storage | null {
  return isBrowser() ? window.localStorage : null;
}

function session(): Storage | null {
  return isBrowser() ? window.sessionStorage : null;
}

/**
 * refreshToken 저장.
 * "로그인 상태 유지"를 선택하면 localStorage, 아니면 sessionStorage에 둔다.
 * accessToken은 XSS 노출을 줄이기 위해 메모리(Zustand)에만 보관하고 저장하지 않는다.
 */
export function saveRefreshToken(token: string, remember: boolean): void {
  const target = remember ? local() : session();
  const other = remember ? session() : local();
  safeSet(target, REFRESH_TOKEN_KEY, token);
  safeRemove(other, REFRESH_TOKEN_KEY);
  safeSet(local(), REMEMBER_KEY, remember ? '1' : '0');
}

export function readRefreshToken(): string | null {
  return safeGet(local(), REFRESH_TOKEN_KEY) ?? safeGet(session(), REFRESH_TOKEN_KEY);
}

export function readRememberMe(): boolean {
  return safeGet(local(), REMEMBER_KEY) === '1';
}

export function clearRefreshToken(): void {
  safeRemove(local(), REFRESH_TOKEN_KEY);
  safeRemove(session(), REFRESH_TOKEN_KEY);
}

/* ─── 임시저장·UI 상태용 범용 헬퍼 (작성 중 글, 배너 닫기 등) ─── */

export function readJson<T>(key: string, storage: 'local' | 'session' = 'local'): T | null {
  const raw = safeGet(storage === 'local' ? local() : session(), key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown, storage: 'local' | 'session' = 'local'): void {
  try {
    safeSet(storage === 'local' ? local() : session(), key, JSON.stringify(value));
  } catch {
    /* 직렬화 실패는 무시 */
  }
}

export function removeKey(key: string, storage: 'local' | 'session' = 'local'): void {
  safeRemove(storage === 'local' ? local() : session(), key);
}
