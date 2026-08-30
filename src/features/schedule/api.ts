'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { get, patch } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';
import type {
  DocumentCheckRequest,
  DocumentCheckResponse,
  MyUniversityExchangeInfoResponse,
} from '@/shared/api/types';

export function useExchangeInfo() {
  return useQuery({
    queryKey: queryKeys.schedule.exchangeInfo(),
    queryFn: () => get<MyUniversityExchangeInfoResponse>(endpoints.schedule.exchangeInfo),
    // 등록된 학교 정보가 없으면 404가 오고, 다시 시도해도 결과가 같다
    retry: false,
  });
}

/** 체크박스는 응답을 기다리지 않고 먼저 반영하고, 실패하면 되돌린다 */
export function useToggleDocumentCheck() {
  const queryClient = useQueryClient();
  const key = queryKeys.schedule.exchangeInfo();

  return useMutation({
    mutationFn: ({ documentId, checked }: { documentId: number; checked: boolean }) => {
      const body: DocumentCheckRequest = { checked };
      return patch<DocumentCheckResponse>(endpoints.schedule.document(documentId), body);
    },
    onMutate: async ({ documentId, checked }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<MyUniversityExchangeInfoResponse>(key);

      if (previous) {
        queryClient.setQueryData<MyUniversityExchangeInfoResponse>(key, {
          ...previous,
          requiredDocuments: previous.requiredDocuments.map((document) =>
            document.id === documentId ? { ...document, checkedByMe: checked } : document,
          ),
        });
      }

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
  });
}
