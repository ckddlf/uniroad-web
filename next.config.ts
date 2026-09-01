import type { NextConfig } from 'next';

/**
 * /backend/* 중계는 rewrites가 아니라 app/backend/[...path]/route.ts가 맡는다.
 * rewrite는 요청 헤더를 손대지 못해 브라우저의 Origin이 백엔드까지 전달되고,
 * 백엔드 CORS 필터가 그 Origin을 보고 403으로 끊기 때문이다.
 */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // TODO(api): 실제 S3 버킷 도메인 확인 후 좁힐 것
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'http', hostname: '**.amazonaws.com' },
    ],
  },
};

export default nextConfig;
