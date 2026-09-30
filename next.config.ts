import type { NextConfig } from 'next';

/**
 * /backend/* 중계는 rewrites가 아니라 app/backend/[...path]/route.ts가 맡는다.
 * rewrite는 요청 헤더를 손대지 못해 브라우저의 Origin이 백엔드까지 전달되고,
 * 백엔드 CORS 필터가 그 Origin을 보고 403으로 끊기 때문이다.
 */
const nextConfig: NextConfig = {
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
