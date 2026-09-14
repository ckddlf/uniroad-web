'use client';

import { useRef, useState } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';

import { cn } from '@/shared/lib/cn';

/** 본문 폭 대비 최소 크기. 이보다 작으면 무엇이 찍혔는지 알아볼 수 없다. */
const MIN_PERCENT = 10;

/**
 * 크기를 끌어서 조절할 수 있는 본문 이미지.
 *
 * 폭을 px이 아니라 본문 폭에 대한 %로 잡는다. 글은 데스크톱(760px)과 휴대폰(약 340px)에서
 * 같은 HTML로 그려지는데, px으로 굳혀 두면 휴대폰에서 이미지만 화면을 뚫고 나가거나
 * 반대로 데스크톱에서 우표만 하게 남는다.
 *
 * 끄는 동안에는 화면만 바꾸고, 손을 뗄 때 한 번만 문서에 반영한다.
 * 움직일 때마다 반영하면 실행 취소를 한 번 누를 때 1px씩 되돌아간다.
 */
export function ResizableImage({ node, updateAttributes, editor, selected }: NodeViewProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  const src = node.attrs.src as string;
  const alt = (node.attrs.alt as string | null) ?? '';
  const width = (node.attrs.displayWidth as string | null) ?? null;

  const startResize = (event: React.PointerEvent<HTMLSpanElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const image = wrapperRef.current?.querySelector('img');
    const available = wrapperRef.current?.offsetWidth ?? 0;
    if (!image || available === 0) return;

    const startX = event.clientX;
    const startWidth = image.offsetWidth;
    let latest = `${Math.round((startWidth / available) * 100)}%`;

    const onMove = (move: PointerEvent) => {
      const next = startWidth + (move.clientX - startX);
      const percent = Math.round((next / available) * 100);
      latest = `${Math.min(100, Math.max(MIN_PERCENT, percent))}%`;
      setDragging(latest);
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      setDragging(null);
      updateAttributes({ displayWidth: latest });
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <NodeViewWrapper ref={wrapperRef} className="blog-image-node">
      <span className="blog-image-frame">
        {/* eslint-disable-next-line @next/next/no-img-element -- 본문 이미지는 임의 주소라 next/image를 쓰지 않는다 */}
        <img
          data-drag-handle
          src={src}
          alt={alt}
          width={(node.attrs.width as number | null) ?? undefined}
          height={(node.attrs.height as number | null) ?? undefined}
          style={{ width: dragging ?? width ?? undefined }}
          className={cn('blog-content-image', selected && 'is-selected')}
        />

        {editor.isEditable && (
          <span
            role="presentation"
            title="끌어서 크기 조절"
            onPointerDown={startResize}
            className="blog-image-handle"
          />
        )}

        {dragging && <span className="blog-image-size">{dragging}</span>}
      </span>
    </NodeViewWrapper>
  );
}
