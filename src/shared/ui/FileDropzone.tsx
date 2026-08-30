'use client';

import { useId, useState, type DragEvent, type ReactNode } from 'react';
import { ImagePlus } from 'lucide-react';

import { cn } from '@/shared/lib/cn';
import { ALLOWED_UPLOAD_EXTENSIONS, MAX_UPLOAD_BYTES } from '@/shared/lib/constants';
import { formatBytes } from '@/shared/lib/format';

const DEFAULT_ACCEPT = ALLOWED_UPLOAD_EXTENSIONS.map((extension) => `.${extension}`).join(',');

export interface FileDropzoneProps {
  onSelect: (files: File[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  accept?: string;
  icon?: ReactNode;
  /** 안내 문구를 직접 지정할 때 */
  description?: ReactNode;
  error?: string;
  className?: string;
}

/** 파일 선택 + 드래그앤드롭 영역. 업로드 자체는 useS3Upload가 맡는다. */
export function FileDropzone({
  onSelect,
  multiple = false,
  disabled = false,
  accept = DEFAULT_ACCEPT,
  icon,
  description,
  error,
  className,
}: FileDropzoneProps) {
  const inputId = useId();
  const [dragging, setDragging] = useState(false);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    onSelect(Array.from(fileList));
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (!disabled) handleFiles(event.dataTransfer.files);
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-8 text-center transition-colors',
          dragging ? 'border-brand-500 bg-brand-50' : 'border-ink-300 bg-surface',
          disabled && 'opacity-60',
          error && 'border-danger',
        )}
      >
        {icon ?? <ImagePlus aria-hidden className="size-6 text-ink-300" />}

        <label
          htmlFor={inputId}
          className={cn(
            'text-body font-medium text-brand-600',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:underline',
          )}
        >
          파일 선택
        </label>

        {description ?? (
          <p className="text-caption text-ink-500">
            또는 이곳에 끌어다 놓으세요 · {ALLOWED_UPLOAD_EXTENSIONS.join(' / ')} ·{' '}
            {formatBytes(MAX_UPLOAD_BYTES)} 이하
          </p>
        )}

        <input
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="sr-only"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = '';
          }}
        />
      </div>

      {error && (
        <p role="alert" className="text-caption text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
