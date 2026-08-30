'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';

import { cn } from '@/shared/lib/cn';

import { FileDropzone } from './FileDropzone';
import { ProgressBar } from './ProgressBar';

export interface ImageUploaderProps {
  /** 업로드가 끝난 이미지 URL 목록 (S3 fileUrl) */
  value: string[];
  /** 파일 선택·드롭 시 호출 — 실제 업로드는 useS3Upload가 담당한다 */
  onSelect: (files: File[]) => void;
  onRemove: (index: number) => void;
  /** 순서 변경을 허용할 때만 전달 */
  onReorder?: (from: number, to: number) => void;
  max?: number;
  uploading?: boolean;
  /** 0~100 */
  progress?: number;
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  className?: string;
}

export function ImageUploader({
  value,
  onSelect,
  onRemove,
  onReorder,
  max = 10,
  uploading = false,
  progress,
  label,
  hint,
  error,
  className,
}: ImageUploaderProps) {
  const remaining = Math.max(0, max - value.length);
  const disabled = uploading || remaining === 0;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && <span className="text-label font-medium text-ink-700">{label}</span>}

      <FileDropzone
        multiple={max > 1}
        disabled={disabled}
        error={error}
        onSelect={(files) => onSelect(files.slice(0, remaining))}
      />

      {remaining === 0 && (
        <p className="text-caption text-ink-500">최대 {max}장까지 올릴 수 있어요.</p>
      )}

      {uploading && <ProgressBar value={progress ?? 0} label="업로드 중" showValue />}

      {hint && !error && <p className="text-caption text-ink-500">{hint}</p>}

      {value.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {value.map((url, index) => (
            <li
              key={url}
              className="group relative aspect-square overflow-hidden rounded-md border border-ink-100"
            >
              <Image
                src={url}
                alt={`첨부 이미지 ${index + 1}`}
                fill
                sizes="160px"
                className="object-cover"
              />

              <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-ink-900/50 p-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                {onReorder && (
                  <span className="flex gap-1">
                    <button
                      type="button"
                      aria-label={`${index + 1}번째 이미지 앞으로`}
                      disabled={index === 0}
                      onClick={() => onReorder(index, index - 1)}
                      className="rounded p-1 text-white disabled:opacity-30"
                    >
                      <ArrowLeft aria-hidden className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={`${index + 1}번째 이미지 뒤로`}
                      disabled={index === value.length - 1}
                      onClick={() => onReorder(index, index + 1)}
                      className="rounded p-1 text-white disabled:opacity-30"
                    >
                      <ArrowRight aria-hidden className="size-3.5" />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  aria-label={`${index + 1}번째 이미지 삭제`}
                  onClick={() => onRemove(index)}
                  className="ml-auto rounded p-1 text-white"
                >
                  <Trash2 aria-hidden className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
