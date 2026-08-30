/**
 * axios 인터셉터(React 밖)에서 라우팅을 트리거하기 위한 얇은 이벤트 버스.
 * window.location을 직접 건드리지 않고 Providers가 등록한 next/navigation 핸들러를 호출한다.
 */

type UnauthorizedHandler = () => void;

let handler: UnauthorizedHandler | null = null;

/** Providers에서 호출. 반환된 함수로 해제한다. */
export function setUnauthorizedHandler(next: UnauthorizedHandler): () => void {
  handler = next;
  return () => {
    if (handler === next) handler = null;
  };
}

/** 재발급까지 실패해 세션이 끊겼을 때 호출된다 */
export function emitUnauthorized(): void {
  handler?.();
}
