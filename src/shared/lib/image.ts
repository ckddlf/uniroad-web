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
