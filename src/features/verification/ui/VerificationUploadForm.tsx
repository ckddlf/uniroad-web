'use client';

import { useState } from 'react';
import { FileText, X } from 'lucide-react';

import { toErrorMessage } from '@/shared/api/errors';
import { useS3Upload } from '@/shared/hooks/useS3Upload';
import { formatBytes } from '@/shared/lib/format';
import { Button, FileDropzone, ProgressBar, useToast } from '@/shared/ui';

import { useSubmitVerification } from '../api';

const ACCEPTED_DOCUMENTS = [
  '교환학생 합격 · 선발 통지서',
  '파견 대학 입학 허가서 (Letter of Acceptance)',
  '국제처 발급 파견 확인서',
  '파견교 학생증',
];

export function VerificationUploadForm({ submitLabel = '인증 제출하기' }: { submitLabel?: string }) {
  const toast = useToast();
  const { uploadFiles, uploading, progress } = useS3Upload('verification');
  const submit = useSubmitVerification();

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | undefined>();

  const pending = uploading || submit.isPending;

  const handleSubmit = async () => {
    if (!file) return;
    setError(undefined);

    try {
      const [uploaded] = await uploadFiles([file]);

      // 인증 서류는 비공개 경로라 공개 URL이 없다. 관리자는 이 key로 조회용 URL을 발급받는다.
      await submit.mutateAsync({ imageUrl: uploaded.fileUrl ?? uploaded.key });

      setFile(null);
      toast.success('제출했어요. 확인 후 알려드릴게요.');
    } catch (caught) {
      const message = toErrorMessage(caught);
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-md border border-ink-100 bg-canvas p-5">
        <p className="text-label font-medium text-ink-700">인정되는 서류 (하나만 올리면 돼요)</p>
        <ul className="mt-2 flex flex-col gap-1">
          {ACCEPTED_DOCUMENTS.map((document) => (
            <li key={document} className="text-body text-ink-700">
              · {document}
            </li>
          ))}
        </ul>

        <p className="mt-4 text-caption text-warning">
          ⚠ 주민등록번호·계좌번호 등은 가려서 올려주세요. 제출한 이미지는 심사를 맡은 운영진만
          열람합니다.
        </p>
      </div>

      {file ? (
        <div className="flex items-center gap-3 rounded-md border border-ink-300 bg-surface px-4 py-3">
          <FileText aria-hidden className="size-5 shrink-0 text-ink-500" />
          <span className="flex-1 truncate text-body text-ink-900">{file.name}</span>
          <span className="shrink-0 text-caption text-ink-500">{formatBytes(file.size)}</span>
          <button
            type="button"
            aria-label="선택한 파일 지우기"
            disabled={pending}
            onClick={() => setFile(null)}
            className="rounded p-1 text-ink-500 hover:bg-ink-100 disabled:opacity-50"
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>
      ) : (
        <FileDropzone
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          disabled={pending}
          error={error}
          onSelect={(files) => {
            setError(undefined);
            setFile(files[0] ?? null);
          }}
        />
      )}

      {pending && <ProgressBar value={uploading ? progress : 100} label="제출 중" showValue />}

      <Button size="lg" fullWidth disabled={!file} loading={pending} onClick={() => void handleSubmit()}>
        {submitLabel}
      </Button>
    </div>
  );
}
