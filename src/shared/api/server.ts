import { unwrap } from './unwrap';

/**
 * 서버 컴포넌트에서 공개 엔드포인트를 부를 때만 사용한다.
 * 브라우저용 프록시 경로(`/backend`)는 상대 경로라 서버에서는 쓸 수 없어 origin을 직접 붙인다.
 *
 * 인증이 필요한 API는 절대 여기서 부르지 않는다 — accessToken은 브라우저 메모리에만 있다.
 */
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN ?? 'https://api.uniroad.kr';

export async function fetchPublic<T>(path: string, revalidateSeconds = 300): Promise<T | null> {
  try {
    const response = await fetch(`${BACKEND_ORIGIN}${path}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: revalidateSeconds },
      // 빌드 시점에도 이 fetch가 돈다. 백엔드가 응답하지 않으면 Next의 정적 생성
      // 타임아웃(60초)에 걸려 배포가 통째로 실패하므로 먼저 끊는다.
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) return null;
    return unwrap<T>(await response.json());
  } catch {
    // 랜딩·공지 미리보기는 실패해도 페이지 전체가 깨지면 안 된다
    return null;
  }
}
