import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const alt = 'UNIROAD — 교환학생 준비부터 현지 생활까지';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * 공유 미리보기의 기본 이미지.
 *
 * 글마다 이미지를 지정하지 않아도 카카오톡·슬랙에서 빈 카드로 뜨지 않게 하는 최후의 보루다.
 * openGraph.images를 지정하지 않은 페이지에 Next가 이 파일을 대신 물려준다
 * (그래서 페이지 쪽에서는 이미지가 없을 때 images 키 자체를 넣지 않아야 한다).
 *
 * 글자를 그리지 않고 워드마크만 올린다. ImageResponse는 woff2를 읽지 못해
 * 한글을 그리려면 TTF 원본을 저장소에 넣어야 하는데, 그만한 값어치가 없다.
 */
export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), 'public', 'logo-uniroad.png'));
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
          borderBottom: '16px solid #1f4f9e',
        }}
      >
        {/* ImageResponse(Satori)가 그리는 화면이라 next/image를 쓸 수 없다 */}
        <img src={logoSrc} alt="" width={684} height={140} />
      </div>
    ),
    size,
  );
}
