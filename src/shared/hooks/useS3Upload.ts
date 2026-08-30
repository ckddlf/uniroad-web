'use client';

import { useCallback, useRef, useState } from 'react';

import { post } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type { PresignedUrlRequestDto, PresignedUrlResponseDto } from '@/shared/api/types';
import {
  ALLOWED_UPLOAD_EXTENSIONS,
  MAX_UPLOAD_BYTES,
} from '@/shared/lib/constants';
import { formatBytes } from '@/shared/lib/format';
import { resizeImage } from '@/shared/lib/image';

/** 일반 이미지는 공개 버킷, 인증 서류는 비공개 경로로 올린다 */
export type UploadScope = 'public' | 'verification';

export interface UploadedFile {
  /** S3 객체 키 */
  key: string;
  /**
   * 공개 접근 URL. 인증 서류(비공개)는 서버가 내려주지 않으므로 null이며,
   * 이때는 key로 read-url을 발급받아 조회한다.
   */
  fileUrl: string | null;
  fileName: string;
  contentType: string;
}

export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UploadError';
  }
}

const MAX_PARALLEL = 3;
const PDF_TYPE = 'application/pdf';

function extensionOf(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}

function validate(file: File): void {
  const extension = extensionOf(file.name);

  if (!(ALLOWED_UPLOAD_EXTENSIONS as readonly string[]).includes(extension)) {
    throw new UploadError(
      `${ALLOWED_UPLOAD_EXTENSIONS.join(', ')} 형식만 올릴 수 있어요. (${file.name})`,
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError(
      `파일 용량은 ${formatBytes(MAX_UPLOAD_BYTES)}까지예요. (${file.name} · ${formatBytes(file.size)})`,
    );
  }
}

/** 서버는 fileType으로 IMAGE / PDF만 받고, contentType이 형식과 맞는지 검사한다 */
function resolveContentType(file: File): { contentType: string; fileType: 'IMAGE' | 'PDF' } {
  if (extensionOf(file.name) === 'pdf') return { contentType: PDF_TYPE, fileType: 'PDF' };

  const contentType = file.type && file.type.startsWith('image/') ? file.type : 'image/jpeg';
  return { contentType, fileType: 'IMAGE' };
}

/**
 * presigned URL로의 PUT은 S3가 직접 서명한 주소다.
 * axios 인스턴스(baseURL·Authorization 헤더)를 태우면 서명이 어긋나 403이 나므로
 * 순수 XHR로 보낸다. XHR을 쓰는 이유는 진행률 이벤트가 필요해서다.
 */
function putToS3(
  uploadUrl: string,
  body: Blob,
  contentType: string,
  onProgress: (ratio: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('PUT', uploadUrl, true);
    request.setRequestHeader('Content-Type', contentType);

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };

    request.onload = () => {
      if (request.status >= 200 && request.status < 300) resolve();
      else reject(new UploadError(`업로드에 실패했어요. (${request.status})`));
    };

    request.onerror = () =>
      reject(new UploadError('업로드 중 연결이 끊겼어요. 잠시 후 다시 시도해주세요.'));
    request.ontimeout = () => reject(new UploadError('업로드 시간이 초과되었어요.'));

    request.timeout = 60_000;
    request.send(body);
  });
}

export interface UseS3UploadResult {
  uploadFiles: (files: File[]) => Promise<UploadedFile[]>;
  uploading: boolean;
  /** 0~100, 여러 개를 올릴 때는 전체 평균 */
  progress: number;
}

export function useS3Upload(scope: UploadScope = 'public'): UseS3UploadResult {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const ratiosRef = useRef<number[]>([]);

  const presignedPath =
    scope === 'verification' ? endpoints.s3.verificationPresignedUrl : endpoints.s3.presignedUrl;

  const uploadOne = useCallback(
    async (file: File, index: number): Promise<UploadedFile> => {
      const { contentType, fileType } = resolveContentType(file);
      const body = fileType === 'IMAGE' ? await resizeImage(file) : file;

      const requestBody: PresignedUrlRequestDto = {
        fileName: file.name,
        contentType,
        fileType,
      };
      const presigned = await post<PresignedUrlResponseDto>(presignedPath, requestBody);

      const report = (ratio: number) => {
        ratiosRef.current[index] = ratio;
        const total = ratiosRef.current.reduce((sum, value) => sum + value, 0);
        setProgress(Math.round((total / ratiosRef.current.length) * 100));
      };

      try {
        await putToS3(presigned.uploadUrl, body, contentType, report);
      } catch {
        // 네트워크가 잠깐 끊긴 경우가 많아 한 번만 다시 시도한다
        await putToS3(presigned.uploadUrl, body, contentType, report);
      }

      report(1);

      return {
        key: presigned.key,
        fileUrl: presigned.fileUrl ?? null,
        fileName: file.name,
        contentType,
      };
    },
    [presignedPath],
  );

  const uploadFiles = useCallback(
    async (files: File[]): Promise<UploadedFile[]> => {
      if (files.length === 0) return [];

      files.forEach(validate);

      setUploading(true);
      setProgress(0);
      ratiosRef.current = new Array<number>(files.length).fill(0);

      try {
        const results: UploadedFile[] = new Array<UploadedFile>(files.length);
        let cursor = 0;

        // 동시에 3개까지만 올린다 — 브라우저 연결 수와 서버 부담을 함께 고려한 값
        const workers = Array.from({ length: Math.min(MAX_PARALLEL, files.length) }, async () => {
          while (cursor < files.length) {
            const index = cursor++;
            results[index] = await uploadOne(files[index], index);
          }
        });

        await Promise.all(workers);
        return results;
      } finally {
        setUploading(false);
      }
    },
    [uploadOne],
  );

  return { uploadFiles, uploading, progress };
}
