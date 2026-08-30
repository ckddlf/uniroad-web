'use client';

import { useState } from 'react';

import { LEGAL_DOCUMENTS, type LegalDocument } from '@/entities/legal/documents';
import { Button, Checkbox, Modal } from '@/shared/ui';

export interface TermsValue {
  service: boolean;
  privacy: boolean;
  age: boolean;
  marketing: boolean;
}

const INITIAL: TermsValue = { service: false, privacy: false, age: false, marketing: false };

export function TermsStep({ onNext }: { onNext: (value: TermsValue) => void }) {
  const [value, setValue] = useState<TermsValue>(INITIAL);
  const [openDocument, setOpenDocument] = useState<LegalDocument | null>(null);

  const requiredDone = value.service && value.privacy && value.age;
  const allChecked = requiredDone && value.marketing;

  const set = (key: keyof TermsValue, checked: boolean) =>
    setValue((current) => ({ ...current, [key]: checked }));

  return (
    <div className="flex flex-col gap-5">
      <Checkbox
        label={<span className="font-medium">전체 동의</span>}
        description="선택 항목을 포함해 모두 동의합니다."
        checked={allChecked}
        onChange={(event) => {
          const checked = event.target.checked;
          setValue({ service: checked, privacy: checked, age: checked, marketing: checked });
        }}
        containerClassName="rounded-md border border-ink-300 p-4"
      />

      <div className="flex flex-col gap-4 px-1">
        {LEGAL_DOCUMENTS.map((document) => (
          <div key={document.key} className="flex items-center justify-between gap-2">
            <Checkbox
              label={`[필수] ${document.title} 동의`}
              checked={value[document.key]}
              onChange={(event) => set(document.key, event.target.checked)}
            />
            <button
              type="button"
              onClick={() => setOpenDocument(document)}
              className="shrink-0 text-caption text-ink-500 underline underline-offset-2"
            >
              보기
            </button>
          </div>
        ))}

        <Checkbox
          label="[필수] 만 14세 이상입니다"
          checked={value.age}
          onChange={(event) => set('age', event.target.checked)}
        />

        <Checkbox
          label="[선택] 마케팅 정보 수신 동의"
          description="새로운 기능과 공지를 이메일로 받아봅니다."
          checked={value.marketing}
          onChange={(event) => set('marketing', event.target.checked)}
        />
      </div>

      <Button size="lg" fullWidth disabled={!requiredDone} onClick={() => onNext(value)}>
        다음
      </Button>

      <Modal
        open={openDocument !== null}
        onClose={() => setOpenDocument(null)}
        title={openDocument?.title}
        size="lg"
      >
        <div className="flex flex-col gap-3 text-body text-ink-700">
          {openDocument?.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </Modal>
    </div>
  );
}
