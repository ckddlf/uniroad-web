'use client';

import { useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Inbox, LogOut, Settings } from 'lucide-react';

import { get } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/queryKeys';
import { ApiError } from '@/shared/api/errors';
import type { NoticeResponse } from '@/shared/api/types';
import { DISPATCH_SEMESTERS } from '@/shared/lib/constants';
import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  Chip,
  DatePicker,
  DateRangePicker,
  Drawer,
  Dropdown,
  DropdownDivider,
  DropdownItem,
  EmptyState,
  ErrorState,
  ImageUploader,
  InfiniteScrollSentinel,
  Input,
  Modal,
  Pagination,
  ProgressBar,
  Radio,
  RadioGroup,
  Select,
  Skeleton,
  SkeletonCard,
  Tabs,
  Textarea,
  Toggle,
  Tooltip,
  useToast,
  type DateRangeValue,
} from '@/shared/ui';

/**
 * 개발 확인용 페이지. STEP 12 마감 때 삭제한다.
 * 프록시(/backend)가 실제로 동작하는지도 여기서 함께 확인한다.
 */
export default function UiKitPage() {
  const toast = useToast();

  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toggle, setToggle] = useState(true);
  const [range, setRange] = useState<DateRangeValue>({ start: '', end: '' });
  const [images, setImages] = useState<string[]>([]);
  const [chips, setChips] = useState<string[]>(['FOOD']);

  const notices = useQuery({
    queryKey: queryKeys.notice.list(),
    queryFn: () => get<NoticeResponse[]>(endpoints.notice.list),
  });

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-12">
      <header className="flex flex-col gap-1">
        <p className="text-caption font-medium text-brand-600">개발 확인용 · 배포 전 삭제</p>
        <h1 className="text-display">UIROAD 공통 컴포넌트</h1>
      </header>

      <Section title="API 프록시 확인" description="GET /api/notices — 인증 없이 열리는 엔드포인트">
        {notices.isPending && <Skeleton className="h-16 w-full" />}
        {notices.isError && <ErrorState error={notices.error} onRetry={() => void notices.refetch()} />}
        {notices.isSuccess && (
          <div className="rounded-md border border-ink-100 bg-surface p-4">
            <p className="text-body">
              공지 {notices.data.length}건을 프록시로 받았습니다.
            </p>
            <ul className="mt-2 flex flex-col gap-1">
              {notices.data.slice(0, 3).map((notice) => (
                <li key={notice.id} className="text-caption text-ink-500">
                  · {notice.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      <Section title="Button">
        <div className="flex flex-wrap items-center gap-3">
          <Button>기본</Button>
          <Button variant="secondary">보조</Button>
          <Button variant="ghost">고스트</Button>
          <Button variant="danger">삭제</Button>
          <Button loading>저장 중</Button>
          <Button disabled>비활성</Button>
          <Button size="sm">small</Button>
          <Button size="lg">large</Button>
        </div>
      </Section>

      <Section title="입력">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="아이디" placeholder="uniroad" required hint="영문·숫자 4~20자" />
          <Input label="비밀번호" type="password" error="영문과 숫자를 포함해 8~20자로 입력해주세요." />
          <Select
            label="파견 학기"
            placeholder="선택해주세요"
            options={DISPATCH_SEMESTERS.map((semester) => ({ value: semester, label: semester }))}
          />
          <DatePicker label="출국일" />
          <Textarea label="내용" placeholder="자유롭게 작성해주세요" maxLength={200} showCount value="" onChange={() => undefined} />
          <DateRangePicker label="여행 기간" value={range} onChange={setRange} />
        </div>

        <div className="mt-4 flex flex-col gap-4">
          <Checkbox label="로그인 상태 유지" defaultChecked />
          <RadioGroup legend="성별" inline required>
            <Radio name="gender" value="MALE" label="남성" defaultChecked />
            <Radio name="gender" value="FEMALE" label="여성" />
          </RadioGroup>
          <Toggle checked={toggle} onChange={setToggle} label="알림 받기" description="새 채팅과 댓글 알림" />
        </div>
      </Section>

      <Section title="표시">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>일반</Badge>
          <Badge tone="brand">✔ 인증</Badge>
          <Badge tone="purple">운영자</Badge>
          <Badge tone="danger">거절</Badge>
          <Badge tone="warning">검토중</Badge>
          <Badge tone="info">공지</Badge>
          <Avatar name="유니" />
          <Avatar name="민수" size="lg" />
          <Tooltip content="교환학생 인증을 마친 회원입니다">
            <span className="text-body underline decoration-dotted">인증이란?</span>
          </Tooltip>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {['FOOD', 'TRANSPORT', 'SHOPPING'].map((value) => (
            <Chip
              key={value}
              selected={chips.includes(value)}
              onClick={() =>
                setChips((current) =>
                  current.includes(value)
                    ? current.filter((item) => item !== value)
                    : [...current, value],
                )
              }
            >
              {value}
            </Chip>
          ))}
          <Chip onRemove={() => toast.info('칩을 삭제했어요')}>파리</Chip>
        </div>

        <ProgressBar className="mt-6 max-w-sm" value={44} label="제출 서류 4/9" showValue />
      </Section>

      <Section title="탐색">
        <Tabs
          aria-label="게시판 구분"
          items={[
            { value: 'all', label: '전체' },
            { value: 'pre', label: '파견 전', count: 12 },
            { value: 'dispatched', label: '파견 중', count: 4 },
          ]}
          value={tab}
          onChange={setTab}
        />

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Dropdown
            label="프로필 메뉴"
            trigger={
              <span className="inline-flex items-center gap-2 rounded-md border border-ink-300 px-3 py-2 text-body">
                <Avatar name="유니" size="sm" /> 유니
              </span>
            }
          >
            <DropdownItem icon={<Settings aria-hidden className="size-4" />}>마이페이지</DropdownItem>
            <DropdownDivider />
            <DropdownItem tone="danger" icon={<LogOut aria-hidden className="size-4" />}>
              로그아웃
            </DropdownItem>
          </Dropdown>

          <Button variant="secondary" onClick={() => setModalOpen(true)}>
            모달 열기
          </Button>
          <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
            드로어 열기
          </Button>
          <Button variant="secondary" onClick={() => toast.success('저장했어요')}>
            토스트
          </Button>
        </div>

        <Pagination className="mt-6" page={page} totalPages={8} onChange={setPage} />
      </Section>

      <Section title="상태">
        <div className="grid gap-4 lg:grid-cols-3">
          <SkeletonCard />
          <EmptyState
            icon={<Inbox aria-hidden className="size-8" />}
            title="아직 글이 없어요"
            description="첫 글을 남기면 다음 기수의 자료가 됩니다."
            action={<Button size="sm">글쓰기</Button>}
          />
          <ErrorState
            error={new ApiError({ message: '일시적인 오류입니다. 잠시 후 다시 시도해주세요.', kind: 'http', status: 500 })}
            onRetry={() => toast.info('다시 시도했어요')}
          />
        </div>

        <InfiniteScrollSentinel hasNext loading onLoadMore={() => undefined} />
      </Section>

      <Section title="이미지 업로더" description="업로드 연결은 STEP 3의 useS3Upload에서 붙인다">
        <ImageUploader
          value={images}
          onSelect={(files) => toast.info(`${files.length}개 파일을 선택했어요`)}
          onRemove={(index) => setImages((current) => current.filter((_, i) => i !== index))}
          max={5}
        />
      </Section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="교환학생 인증이 필요해요"
        description="거래·동행 기능은 파견이 확인된 회원만 이용할 수 있어요."
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              나중에 하기
            </Button>
            <Button onClick={() => setModalOpen(false)}>인증하러 가기</Button>
          </>
        }
      >
        <p className="text-body text-ink-700">사기 피해를 막기 위한 조치입니다.</p>
      </Modal>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="필터">
        <p className="text-body text-ink-700">모바일에서 목록 필터를 담는 자리입니다.</p>
      </Drawer>
    </main>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-h2">{title}</h2>
        {description && <p className="text-caption text-ink-500">{description}</p>}
      </div>
      {children}
    </section>
  );
}
