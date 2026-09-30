import type { NextConfig } from 'next';

/**
 * /backend/* 중계는 rewrites가 아니라 app/backend/[...path]/route.ts가 맡는다.
 * rewrite는 요청 헤더를 손대지 못해 브라우저의 Origin이 백엔드까지 전달되고,
 * 백엔드 CORS 필터가 그 Origin을 보고 403으로 끊기 때문이다.
 */
const nextConfig: NextConfig = {
  // 동적 페이지((app) 그룹)의 메타데이터는 기본값이면 <head>가 닫힌 뒤 본문 쪽으로 흘려 보내진다.
  // Googlebot은 이 방식 대상이라 noindex·canonical이 원본 HTML의 <head>에 없고, 스크립트를 돌려야 보인다.
  // 이 앱은 메타데이터를 기다리며 데이터를 받는 곳이 SSG 페이지뿐이라 흘려 보낼 이득이 없으므로 끈다.
  htmlLimitedBots: /.*/,
  images: {
    // S3 사진은 Cache-Control 없이 내려와 최적화본이 기본값(60초)마다 만료된다. Vercel은 만료 뒤
    // 다시 만드는 것도 변환 1회로 세므로 한도가 금방 찬다. 파일 이름에 UUID가 붙어 같은 주소의
    // 내용이 바뀌지 않으니 길게 둔다(31일). 인증 서류 사진은 unoptimized라 여기에 해당하지 않는다.
    minimumCacheTTL: 2678400,
    remotePatterns: [
      // TODO(api): 실제 S3 버킷 도메인 확인 후 좁힐 것
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'http', hostname: '**.amazonaws.com' },
    ],
  },
};

export default nextConfig;
