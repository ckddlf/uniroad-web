import { get, post } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type {
  LoginRequest,
  MemberResponseDto,
  OnboardingRequest,
  SignUpRequest,
  TokenResponse,
} from '@/shared/api/types';

export const authApi = {
  /** 응답은 memberId뿐이고 토큰이 없다 — 가입 직후 로그인을 이어서 호출해야 한다 */
  signUp: (body: SignUpRequest) => post<number>(endpoints.auth.signUp, body),

  login: (body: LoginRequest) => post<TokenResponse>(endpoints.auth.login, body),

  logout: () => post<void>(endpoints.auth.logout),

  onboarding: (body: OnboardingRequest) => post<void>(endpoints.auth.onboarding, body),

  /** 2xx면 사용 가능, 409(DUPLICATE_USERNAME)면 이미 쓰는 아이디 */
  checkUsername: (username: string) => get<void>(endpoints.auth.checkUsername, { username }),

  checkEmail: (email: string) => get<void>(endpoints.auth.checkEmail, { email }),

  me: () => get<MemberResponseDto>(endpoints.member.me),
};
