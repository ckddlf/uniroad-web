'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';

import { useCountryOptions } from '@/features/country/api';
import { toErrorMessage } from '@/shared/api/errors';
import type { TradeCategory, UsedItemResponseDto } from '@/shared/api/types';
import { useS3Upload } from '@/shared/hooks/useS3Upload';
import { DISPATCH_SEMESTERS } from '@/shared/lib/constants';
import { applyServerFieldErrors } from '@/shared/lib/form';
import {
  Button,
  FileDropzone,
  Input,
  ProgressBar,
  Select,
  SelectOrCustom,
  Textarea,
  useToast,
} from '@/shared/ui';

import { useCreateUsedItem, useUpdateUsedItem } from '../api';
import {
  USED_ITEM_DEFAULTS,
  toUsedItemRequest,
  usedItemSchema,
  type UsedItemFormValues,
} from '../model/usedItemSchema';
import { CategoryImagesField } from './CategoryImagesField';
import { TradeItemsField } from './TradeItemsField';

export interface UsedItemFormProps {
  /** 수정일 때만 전달 */
  itemId?: number;
  initial?: UsedItemResponseDto;
}

function toDefaults(initial?: UsedItemResponseDto): UsedItemFormValues {
  if (!initial) return USED_ITEM_DEFAULTS;

  return {
    title: initial.title,
    content: initial.content,
    price: String(initial.price),
    country: initial.country,
    region: initial.region,
    semester: initial.semester,
    items: (initial.items ?? []).map((item) => ({
      category: item.category,
      name: item.name,
      quantity: String(item.quantity),
    })),
  };
}

export function UsedItemForm({ itemId, initial }: UsedItemFormProps) {
  const router = useRouter();
  const toast = useToast();
  const countries = useCountryOptions();
  const isEdit = itemId !== undefined;

  const createItem = useCreateUsedItem();
  const updateItem = useUpdateUsedItem(itemId ?? 0);
  const { uploadFiles, uploading, progress } = useS3Upload('public');

  const [thumbnail, setThumbnail] = useState(initial?.thumbnailImageUrl ?? '');
  const [thumbnailError, setThumbnailError] = useState<string | undefined>();
  const [categoryImages, setCategoryImages] = useState<Partial<Record<TradeCategory, string>>>(
    () =>
      Object.fromEntries(
        (initial?.categoryImages ?? []).map((image) => [image.category, image.imageUrl]),
      ) as Partial<Record<TradeCategory, string>>,
  );

  const form = useForm<UsedItemFormValues>({
    resolver: zodResolver(usedItemSchema),
    defaultValues: toDefaults(initial),
    mode: 'onBlur',
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  const uploadSingle = async (files: File[]): Promise<string | null> => {
    try {
      const [uploaded] = await uploadFiles(files.slice(0, 1));
      return uploaded?.fileUrl ?? null;
    } catch (error) {
      toast.error(toErrorMessage(error));
      return null;
    }
  };

  const submit = handleSubmit(async (values) => {
    if (thumbnail === '') {
      setThumbnailError('대표 사진을 올려주세요.');
      return;
    }

    const body = toUsedItemRequest(values, thumbnail, categoryImages);

    try {
      if (isEdit) {
        await updateItem.mutateAsync(body);
        toast.success('수정했어요.');
        router.replace(`/market/${itemId}`);
        return;
      }

      const newId = await createItem.mutateAsync(body);
      toast.success('판매글을 올렸어요.');
      router.replace(`/market/${newId}`);
    } catch (error) {
      if (applyServerFieldErrors(error, setError, ['title', 'content', 'price', 'country', 'region', 'semester'])) {
        return;
      }
      toast.error(toErrorMessage(error));
    }
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={submit} className="flex flex-col gap-10" noValidate>
        <section className="flex flex-col gap-5">
          <h2 className="text-h2 text-ink-900">① 기본 정보</h2>

          <Input
            label="제목"
            required
            maxLength={100}
            placeholder="예: 자취 살림 통째로 넘겨요"
            error={errors.title?.message}
            {...register('title')}
          />

          <Textarea
            label="설명"
            required
            rows={8}
            placeholder="상태와 거래 방법을 적어주세요."
            error={errors.content?.message}
            {...register('content')}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="가격"
              required
              type="number"
              min={0}
              inputMode="numeric"
              hint="현지 통화 기준으로 입력해주세요."
              error={errors.price?.message}
              {...register('price')}
            />

            <Select
              label="거래 학기"
              required
              placeholder="선택해주세요"
              options={DISPATCH_SEMESTERS.map((semester) => ({ value: semester, label: semester }))}
              error={errors.semester?.message}
              {...register('semester')}
            />

            <SelectOrCustom
              label="국가"
              required
              placeholder={countries.isPending ? '불러오는 중…' : '선택해주세요'}
              options={countries.options}
              customPlaceholder="예: 프랑스"
              hint={countries.fallbackHint}
              error={errors.country?.message}
              value={watch('country')}
              onChange={(value) =>
                setValue('country', value, { shouldDirty: true, shouldValidate: true })
              }
            />

            <Input
              label="지역"
              required
              placeholder="예: 파리"
              error={errors.region?.message}
              {...register('region')}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-label font-medium text-ink-700">
              대표 사진<span aria-hidden className="ml-0.5 text-danger">*</span>
            </span>

            {thumbnail ? (
              <div className="relative aspect-video max-w-md overflow-hidden rounded-md border border-ink-100">
                <Image src={thumbnail} alt="대표 사진" fill sizes="448px" className="object-cover" />
                <button
                  type="button"
                  aria-label="대표 사진 삭제"
                  onClick={() => setThumbnail('')}
                  className="absolute top-2 right-2 rounded-md bg-ink-900/60 p-1.5 text-white"
                >
                  <Trash2 aria-hidden className="size-3.5" />
                </button>
              </div>
            ) : (
              <FileDropzone
                accept=".jpg,.jpeg,.png,.webp"
                disabled={uploading}
                error={thumbnailError}
                onSelect={async (files) => {
                  setThumbnailError(undefined);
                  const url = await uploadSingle(files);
                  if (url) setThumbnail(url);
                }}
              />
            )}
          </div>
        </section>

        <section className="flex flex-col gap-5">
          <h2 className="text-h2 text-ink-900">② 판매 품목</h2>
          <TradeItemsField />
        </section>

        <section className="flex flex-col gap-5">
          <h2 className="text-h2 text-ink-900">③ 카테고리별 사진</h2>
          <CategoryImagesField
            value={categoryImages}
            disabled={uploading}
            onSelect={async (category, files) => {
              const url = await uploadSingle(files);
              if (url) setCategoryImages((current) => ({ ...current, [category]: url }));
            }}
            onRemove={(category) =>
              setCategoryImages((current) => {
                const next = { ...current };
                delete next[category];
                return next;
              })
            }
          />
        </section>

        {uploading && <ProgressBar value={progress} label="사진 업로드 중" showValue />}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            취소
          </Button>
          <Button type="submit" loading={isSubmitting} disabled={uploading}>
            {isEdit ? '수정 완료' : '등록하기'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
