import { z } from 'zod';

/** 서버와 동일한 비밀번호 규칙: 영문·숫자 포함 8~20자 */
export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,20}$/;

export const passwordSchema = z
  .string()
  .min(1, '비밀번호를 입력해주세요.')
  .regex(PASSWORD_PATTERN, '영문과 숫자를 포함해 8~20자로 입력해주세요.');

/** 회원가입 화면의 실시간 체크리스트용 */
export function passwordChecks(value: string): {
  hasLetter: boolean;
  hasDigit: boolean;
  hasLength: boolean;
} {
  return {
    hasLetter: /[A-Za-z]/.test(value),
    hasDigit: /\d/.test(value),
    hasLength: value.length >= 8 && value.length <= 20,
  };
}

export const usernameSchema = z
  .string()
  .min(4, '아이디는 4자 이상 입력해주세요.')
  .max(20, '아이디는 20자 이하로 입력해주세요.')
  .regex(/^[A-Za-z0-9_]+$/, '영문·숫자·밑줄만 사용할 수 있습니다.');

export const nameSchema = z
  .string()
  .min(1, '이름을 입력해주세요.')
  .max(20, '이름은 20자 이하로 입력해주세요.');

export const nicknameSchema = z
  .string()
  .min(1, '닉네임을 입력해주세요.')
  .max(30, '닉네임은 30자 이하로 입력해주세요.');

export const emailSchema = z.string().email('이메일 형식이 올바르지 않습니다.');

/** 동행 참여는 카카오 오픈채팅으로만 연결한다 */
export const openChatLinkSchema = z
  .string()
  .min(1, '오픈채팅 링크를 입력해주세요.')
  .url('링크 형식이 올바르지 않습니다.')
  .refine(
    (value) => value.startsWith('https://open.kakao.com/'),
    '카카오톡 오픈채팅 링크(https://open.kakao.com/…)를 입력해주세요.',
  );

/** yyyy-MM-dd */
export const serverDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜를 선택해주세요.');

/** HH:mm */
export const serverTimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, '시간을 HH:mm 형식으로 입력해주세요.');
