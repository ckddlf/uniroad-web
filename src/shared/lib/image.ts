import { MAX_IMAGE_EDGE } from './constants';

/**
 * 긴 변이 MAX_IMAGE_EDGE를 넘는 이미지만 축소한다.
 * 원본 MIME을 유지해야 presigned URL 서명의 Content-Type과 어긋나지 않는다.
 * 브라우저가 처리하지 못하는 형식이면 원본을 그대로 돌려준다.
 */
export async function resizeImage(file: File, maxEdge = MAX_IMAGE_EDGE): Promise<File> {
  if (!file.type.startsWith('image/')) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const longestEdge = Math.max(bitmap.width, bitmap.height);

    if (longestEdge <= maxEdge) {
      bitmap.close();
      return file;
    }

    const scale = maxEdge / longestEdge;
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) return file;

    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, file.type, 0.9);
    });

    if (!blob) return file;
    return new File([blob], file.name, { type: file.type, lastModified: file.lastModified });
  } catch {
    return file;
  }
}

export interface ImageSize {
  width: number;
  height: number;
}

/**
 * 업로드된 뒤의 이미지 크기를 읽는다.
 *
 * 본문 img에 width/height를 실어두면 브라우저가 내려받기 전에 자리를 비워둘 수 있어
 * 로딩 중 글이 밀리지 않는다(CLS). 이 밀림은 Core Web Vitals로 검색 순위에 반영된다.
 *
 * resizeImage와 같은 규칙으로 긴 변을 줄여서 돌려준다. 실제로 올라가는 것은 축소본이므로
 * 원본 크기를 그대로 실으면 저장된 파일과 속성이 어긋난다.
 * 크기를 못 읽는 형식이면 null을 주고, 부르는 쪽은 속성 없이 진행한다.
 */
export async function readImageSize(file: File, maxEdge = MAX_IMAGE_EDGE): Promise<ImageSize | null> {
  if (!file.type.startsWith('image/')) return null;

  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    bitmap.close();

    const longestEdge = Math.max(width, height);
    if (longestEdge <= maxEdge) {
      return { width, height };
    }

    const scale = maxEdge / longestEdge;
    return { width: Math.round(width * scale), height: Math.round(height * scale) };
  } catch {
    return null;
  }
}
