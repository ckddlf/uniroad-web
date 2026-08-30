'use client';

import { useMutation } from '@tanstack/react-query';

import { post } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type { ReportRequest } from '@/shared/api/types';

export function useCreateReport() {
  return useMutation({
    mutationFn: (body: ReportRequest) => post<number>(endpoints.report.create, body),
  });
}
