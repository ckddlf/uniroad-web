import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import { readRefreshToken } from '@/shared/lib/storage';
import { applyRefreshedTokens, clearSession, getAccessToken } from '@/shared/store/authStore';

import { emitUnauthorized } from './authEvents';
import { endpoints } from './endpoints';
import { ApiError, messageForStatus, networkErrorMessage, readErrorBody } from './errors';
import { unwrap } from './unwrap';
import type { ApiResponse, ReissueRequest, TokenResponse } from './types';

/**
 * 브라우저는 항상 프록시 경로(`/backend`)로 호출하고 Next 서버가 백엔드로 중계한다.
 * 백엔드가 HTTPS + CORS를 지원하면 이 환경 변수만 바꾸면 프록시를 끌 수 있다.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/backend';

interface RetriableConfig extends InternalAxiosRequestConfig {
  /** 재발급 후 재시도는 요청당 한 번만 */
  _retried?: boolean;
}

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
  // Pageable을 ?page=0&size=20&sort=createdAt,desc 형태로 평탄화한다
  paramsSerializer: { indexes: null },
});

/** 재발급 전용 인스턴스 — 인터셉터를 달지 않아 무한 루프를 막는다 */
const reissueClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

/** 재발급을 시도하지 않는 경로 (실패해도 로그인 화면으로 보내지 않는다) */
const NO_REFRESH_PATHS: readonly string[] = [
  endpoints.auth.login,
  endpoints.auth.signUp,
  endpoints.auth.reissue,
  endpoints.auth.checkUsername,
  endpoints.auth.checkEmail,
];

export { unwrap };

function toApiError(error: AxiosError): ApiError {
  if (error.code === 'ECONNABORTED') {
    return new ApiError({ message: '요청 시간이 초과되었습니다.', kind: 'timeout' });
  }
  if (!error.response) {
    return new ApiError({ message: networkErrorMessage(), kind: 'network' });
  }

  const { status, data } = error.response;
  const parsed = readErrorBody(data);
  return new ApiError({
    message: parsed.message ?? messageForStatus(status),
    kind: 'http',
    status,
    code: parsed.code ?? null,
    body: data,
    fieldErrors: parsed.errors ?? null,
  });
}

/* ─────────── 토큰 재발급: 동시 401이 여러 개여도 1회만 ─────────── */

let refreshPromise: Promise<string> | null = null;

async function requestReissue(): Promise<string> {
  const refreshToken = readRefreshToken();
  if (!refreshToken) throw new Error('no refresh token');

  const payload: ReissueRequest = { refreshToken };
  const res = await reissueClient.post<ApiResponse<TokenResponse>>(
    endpoints.auth.reissue,
    payload,
  );
  const token = unwrap<TokenResponse>(res.data);
  if (!token?.accessToken) throw new Error('invalid reissue response');

  applyRefreshedTokens(token);
  return token.accessToken;
}

/** 진행 중인 재발급이 있으면 그 결과를 함께 기다린다 */
export function reissueOnce(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = requestReissue().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/* ─────────── 인터셉터 ─────────── */

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => {
    response.data = unwrap(response.data);
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    const skipRefresh =
      !config ||
      config._retried ||
      NO_REFRESH_PATHS.some((path) => config.url?.startsWith(path));

    if (status !== 401 || skipRefresh) {
      return Promise.reject(toApiError(error));
    }

    try {
      const accessToken = await reissueOnce();
      config._retried = true;
      const headers = AxiosHeaders.from(config.headers);
      headers.set('Authorization', `Bearer ${accessToken}`);
      config.headers = headers;
      return await api.request(config);
    } catch {
      clearSession();
      emitUnauthorized();
      return Promise.reject(toApiError(error));
    }
  },
);

/* ─────────── 얇은 래퍼 (호출부에서 res.data 반복을 줄인다) ─────────── */

export async function get<T>(url: string, params?: unknown): Promise<T> {
  const res = await api.get<T>(url, { params: params as Record<string, unknown> });
  return res.data;
}

export async function post<T>(url: string, body?: unknown): Promise<T> {
  const res = await api.post<T>(url, body);
  return res.data;
}

export async function put<T>(url: string, body?: unknown): Promise<T> {
  const res = await api.put<T>(url, body);
  return res.data;
}

export async function patch<T>(url: string, body?: unknown): Promise<T> {
  const res = await api.patch<T>(url, body);
  return res.data;
}

export async function del<T>(url: string, params?: unknown): Promise<T> {
  const res = await api.delete<T>(url, { params: params as Record<string, unknown> });
  return res.data;
}
