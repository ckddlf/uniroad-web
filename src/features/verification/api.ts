'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { get, post } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';
import type {
  PrivatePresignedUrlRequestDto,
  PrivatePresignedUrlResponseDto,
  VerificationRequest,
  VerificationResponse,
} from '@/shared/api/types';

/** 제출 이력은 최신순으로 정렬해 첫 항목을 현재 상태로 본다 */
function sortLatestFirst(items: VerificationResponse[]): VerificationResponse[] {
  return [...items].sort((a, b) => {
    const diff = new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    return Number.isNaN(diff) || diff === 0 ? b.id - a.id : diff;
  });
}

export function useMyVerifications() {
  return useQuery({
    queryKey: queryKeys.verification.me(),
    queryFn: async () => sortLatestFirst(await get<VerificationResponse[]>(endpoints.verification.me)),
    staleTime: 0,
  });
}

export function useSubmitVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: VerificationRequest) =>
      post<VerificationResponse>(endpoints.verification.root, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.verification.me() });
    },
  });
}

/** 비공개 버킷에 있는 인증 서류는 10분짜리 조회용 presigned URL을 받아야 볼 수 있다 */
export function requestVerificationReadUrl(key: string): Promise<PrivatePresignedUrlResponseDto> {
  const body: PrivatePresignedUrlRequestDto = { key };
  return post<PrivatePresignedUrlResponseDto>(endpoints.s3.verificationReadUrl, body);
}

/**
 * 제출 값이 S3 key면 조회용 URL을 발급받고, 전체 URL이면 그대로 쓴다.
 * 발급된 URL은 10분 뒤 만료되므로 그보다 짧게 캐시한다.
 */
export function useVerificationImageUrl(imageUrl: string | null | undefined) {
  const value = imageUrl ?? '';
  const isDirectUrl = value.startsWith('http://') || value.startsWith('https://');

  const query = useQuery({
    queryKey: ['verification', 'readUrl', value],
    queryFn: () => requestVerificationReadUrl(value),
    enabled: value !== '' && !isDirectUrl,
    staleTime: 8 * 60 * 1000,
    retry: false,
  });

  return {
    url: isDirectUrl ? value : query.data?.downloadUrl,
    isPending: !isDirectUrl && value !== '' && query.isPending,
    isError: query.isError,
  };
}
