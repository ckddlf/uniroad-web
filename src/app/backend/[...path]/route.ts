import type { NextRequest } from 'next/server';

/**
 * 브라우저 → /backend/* → (여기) → 백엔드 중계.
 *
 * next.config의 rewrites로는 이 일을 할 수 없다. rewrite는 요청 헤더를 그대로
 * 흘려보내는데, 브라우저는 same-origin POST에도 Origin을 붙인다. 그 Origin이
 * 백엔드까지 가면 CORS 필터가 허용 목록(https://uniroad.kr)에 없는 값을 보고
 * 컨트롤러 도달 전에 403으로 끊는다. 여기서 Origin을 떼어 순수한 서버 간
 * 요청으로 만든다 — 그래야 배포 주소가 뭐든, localhost든 동일하게 동작한다.
 */
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN ?? 'https://api.uniroad.kr';

/** 중계하면서 다시 만들어지거나, 백엔드를 헷갈리게 하는 요청 헤더 */
const STRIP_REQUEST_HEADERS = new Set([
  'host',
  'origin',
  'referer',
  'connection',
  'content-length',
  'accept-encoding',
  'x-forwarded-for',
  'x-forwarded-host',
  'x-forwarded-proto',
]);

/** 본문을 이미 디코드해 들고 있으므로 원본 인코딩 정보는 버린다 */
const STRIP_RESPONSE_HEADERS = new Set([
  'content-encoding',
  'content-length',
  'transfer-encoding',
  'connection',
]);

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const target = `${BACKEND_ORIGIN}/${path.join('/')}${request.nextUrl.search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!STRIP_REQUEST_HEADERS.has(key)) headers.set(key, value);
  });

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';

  const response = await fetch(target, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    // 리다이렉트는 서버에서 끝낸다. 브라우저로 흘리면 백엔드로 직행해 CORS에 막힌다.
    redirect: 'follow',
    cache: 'no-store',
  });

  const responseHeaders = new Headers();
  response.headers.forEach((value, key) => {
    if (!STRIP_RESPONSE_HEADERS.has(key)) responseHeaders.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
export const OPTIONS = proxy;

export const dynamic = 'force-dynamic';
