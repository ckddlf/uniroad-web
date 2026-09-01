import type { NextConfig } from 'next';

/**
 * 백엔드 CORS 허용 도메인이 제한되어 있어 Next 서버가 /backend/* 를 중계한다.
 * 백엔드가 CORS를 열어주면 NEXT_PUBLIC_API_BASE_URL만 바꿔 프록시를 끌 수 있다.
 *
 * origin은 https로 둔다 — http(80)는 301로 https를 가리키기만 하고,
 * 리다이렉트를 프록시가 그대로 흘려보내면 브라우저가 백엔드로 직접 가 CORS에 막힌다.
 */
const API_ORIGIN = process.env.BACKEND_ORIGIN ?? 'https://api.uniroad.kr';

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: '/backend/:path*', destination: `${API_ORIGIN}/:path*` }];
  },
  images: {
    remotePatterns: [
      // TODO(api): 실제 S3 버킷 도메인 확인 후 좁힐 것
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'http', hostname: '**.amazonaws.com' },
    ],
  },
};

export default nextConfig;
