'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

import { RoleBadge } from '@/entities/member/ui/RoleBadge';
import { toErrorMessage } from '@/shared/api/errors';
import type { MemberResponseDto, Role } from '@/shared/api/types';
import { ROLE } from '@/shared/lib/constants';
import { displayName } from '@/shared/lib/format';
import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  Modal,
  Pagination,
  Select,
  Skeleton,
  useToast,
} from '@/shared/ui';

import { useAdminMembers, useDeleteMember, useUpdateMemberRole } from '../api';

const PAGE_SIZE = 20;
const ROLES: Role[] = ['USER', 'VERIFIED', 'ADMIN'];

export function AdminMembers() {
  const toast = useToast();
  const members = useAdminMembers();
  const updateRole = useUpdateMemberRole();
  const deleteMember = useDeleteMember();

  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const [page, setPage] = useState(0);
  const [target, setTarget] = useState<MemberResponseDto | null>(null);
  const [confirmName, setConfirmName] = useState('');

  const filtered = useMemo(() => {
    const text = keyword.trim().toLowerCase();

    return (members.data ?? []).filter((member) => {
      if (roleFilter && member.role !== roleFilter) return false;
      if (text === '') return true;

      return [member.name, member.nickname, member.username, member.email, member.domesticUniversity]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(text));
    });
  }, [members.data, keyword, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const changeRole = (memberId: number, role: Role) => {
    updateRole.mutate(
      { memberId, role },
      {
        onSuccess: () => toast.success(`등급을 ${ROLE[role]}(으)로 변경했어요.`),
        onError: (error) => toast.error(toErrorMessage(error)),
      },
    );
  };

  const remove = () => {
    if (!target) return;

    deleteMember.mutate(target.id, {
      onSuccess: () => {
        toast.success('회원을 삭제했어요.');
        setTarget(null);
        setConfirmName('');
      },
      onError: (error) => toast.error(toErrorMessage(error)),
    });
  };

  if (members.isPending) return <Skeleton className="h-96 w-full" />;
  if (members.isError) {
    return <ErrorState error={members.error} onRetry={() => void members.refetch()} />;
  }

  const expectedName = target ? displayName(target.nickname, target.name) : '';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-56 flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-500"
          />
          <input
            type="search"
            aria-label="회원 검색"
            placeholder="이름·아이디·이메일·학교로 검색"
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setPage(0);
            }}
            className="h-10 w-full rounded-md border border-ink-300 bg-surface pr-3 pl-9 text-body placeholder:text-ink-300 focus:border-brand-500"
          />
        </div>

        <Select
          aria-label="등급 필터"
          placeholder="전체 등급"
          containerClassName="w-40"
          options={ROLES.map((role) => ({ value: role, label: ROLE[role] }))}
          value={roleFilter}
          onChange={(event) => {
            setRoleFilter(event.target.value as Role | '');
            setPage(0);
          }}
        />
      </div>

      <p className="text-caption text-ink-500">전체 {filtered.length}명</p>

      {visible.length === 0 ? (
        <EmptyState title="조건에 맞는 회원이 없어요" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-ink-100 bg-surface">
          <table className="w-full min-w-[720px] border-collapse text-body">
            <thead>
              <tr className="border-b border-ink-100 text-left text-caption text-ink-500">
                <th scope="col" className="px-4 py-3 font-medium">이름</th>
                <th scope="col" className="px-4 py-3 font-medium">아이디</th>
                <th scope="col" className="px-4 py-3 font-medium">이메일</th>
                <th scope="col" className="px-4 py-3 font-medium">학교</th>
                <th scope="col" className="px-4 py-3 font-medium">등급</th>
                <th scope="col" className="px-4 py-3 font-medium">관리</th>
              </tr>
            </thead>

            <tbody>
              {visible.map((member) => (
                <tr key={member.id} className="border-b border-ink-100 last:border-b-0">
                  <td className="px-4 py-3">
                    <span className="text-ink-900">{displayName(member.nickname, member.name)}</span>
                    <span className="ml-2 text-caption text-ink-500">{member.name}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-700">{member.username}</td>
                  <td className="px-4 py-3 text-ink-500">{member.email ?? '-'}</td>
                  <td className="px-4 py-3 text-ink-500">{member.domesticUniversity ?? '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <RoleBadge role={member.role} />
                      <Select
                        aria-label={`${member.name} 등급 변경`}
                        containerClassName="w-28"
                        options={ROLES.map((role) => ({ value: role, label: ROLE[role] }))}
                        value={member.role}
                        onChange={(event) => changeRole(member.id, event.target.value as Role)}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        setTarget(member);
                        setConfirmName('');
                      }}
                    >
                      삭제
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <Modal
        open={target !== null}
        onClose={() => setTarget(null)}
        title="회원을 삭제할까요?"
        description="삭제하면 되돌릴 수 없습니다. 작성한 글과 기록이 함께 사라집니다."
        size="sm"
        dismissOnBackdrop={false}
        footer={
          <>
            <Button variant="ghost" onClick={() => setTarget(null)}>
              취소
            </Button>
            <Button
              variant="danger"
              disabled={confirmName.trim() !== expectedName}
              loading={deleteMember.isPending}
              onClick={remove}
            >
              삭제
            </Button>
          </>
        }
      >
        <Input
          label={`확인을 위해 "${expectedName}" 을 입력해주세요`}
          value={confirmName}
          onChange={(event) => setConfirmName(event.target.value)}
        />
      </Modal>
    </div>
  );
}
