import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * globals.css의 @theme에서 정의한 글자 크기 토큰.
 *
 * tailwind-merge는 기본 스케일(sm·lg·xl…)만 크기로 알아본다. `text-body`처럼 이름이 다른
 * 토큰은 크기가 아니라 "글자 색"으로 분류해버리고, 그러면 같이 넘긴 `text-white`가
 * 충돌로 판정돼 조용히 지워진다(primary 버튼 글씨가 검게 나오던 원인).
 * 크기 그룹에 이름을 직접 등록해 색과 크기가 서로를 밀어내지 않게 한다.
 */
const FONT_SIZES = [
  'display',
  'h1',
  'h2',
  'body',
  'caption',
  'label',
  'hero',
  'section',
  'subsection',
  'lead',
];

/** 마찬가지로 --shadow-card / --shadow-pop 도 그림자 "색"으로 오해받는다 */
const SHADOWS = ['card', 'pop'];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: FONT_SIZES }],
      shadow: [{ shadow: SHADOWS }],
    },
  },
});

/** 조건부 클래스 결합 + Tailwind 클래스 충돌 정리 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
