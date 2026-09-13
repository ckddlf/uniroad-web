'use client';

import { useState, type KeyboardEvent } from 'react';

import { cn } from '@/shared/lib/cn';

import { Chip } from './Chip';
import { inputBaseClass, inputStateClass } from './Field';

export interface TagInputProps {
  id?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  max?: number;
  maxLengthPerTag?: number;
}

/**
 * Enter·쉼표로 태그를 추가하고 Backspace로 마지막 것을 지운다.
 *
 * 서버도 같은 정리(소문자·공백 정돈·중복 제거)를 하지만 여기서도 해둔다.
 * 저장하고 나서야 "교환학생"이 "교환학생 "과 합쳐진 걸 보면 작성자가 놀란다.
 */
export function TagInput({
  id,
  value,
  onChange,
  placeholder = 'Enter 또는 쉼표로 추가',
  max = 10,
  maxLengthPerTag = 30,
}: TagInputProps) {
  const [draft, setDraft] = useState('');
  const full = value.length >= max;

  const commit = (raw: string) => {
    const tag = raw.trim().replace(/\s+/g, ' ').toLowerCase().slice(0, maxLengthPerTag);
    if (tag === '' || value.includes(tag) || full) {
      setDraft('');
      return;
    }
    onChange([...value, tag]);
    setDraft('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      // Enter가 폼 저장으로 새어 나가면 태그를 넣다가 글이 저장된다
      event.preventDefault();
      commit(draft);
      return;
    }
    if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <Chip key={tag} onRemove={() => onChange(value.filter((item) => item !== tag))}>
              {tag}
            </Chip>
          ))}
        </div>
      )}

      <input
        id={id}
        type="text"
        value={draft}
        disabled={full}
        placeholder={full ? `태그는 ${max}개까지 넣을 수 있어요` : placeholder}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        // 입력만 하고 다른 곳을 눌러도 남아 있던 글자가 태그가 된다
        onBlur={() => commit(draft)}
        maxLength={maxLengthPerTag}
        className={cn(inputBaseClass, inputStateClass(false), 'h-10')}
      />
    </div>
  );
}
