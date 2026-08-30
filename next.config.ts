import type { NextConfig } from 'next';

/**
 * 백엔드는 현재 http로만 서비스되고 CORS 허용 도메인이 제한되어 있다.
 * 브라우저에서 직접 호출하면 mixed content + CORS로 차단되므로
 * Next 서버가 /backend/* 를 백엔드로 중계한다.
 * 백엔드가 HTTPS + CORS를 지원하면 NEXT_PUBLIC_API_BASE_URL만 바꾸면 된다.
 */
const API_ORIGIN = process.env.BACKEND_ORIGIN ?? 'http://api.uniroad.kr';

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
