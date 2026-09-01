import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

import { endpoints } from '@/shared/api/endpoints';
import { fetchPublic } from '@/shared/api/server';
import type { NoticeResponse } from '@/shared/api/types';
import { formatDate } from '@/shared/lib/date';

import { Card, Section, SectionHeading } from './Section';

const FAQ = [
  {
    question: '아직 파견교가 정해지지 않았는데 가입해도 되나요?',
    answer:
      '됩니다. 온보딩에서 "아직 파견교가 정해지지 않았어요"를 선택하면 학교 정보 없이 시작할 수 있고, 정해진 뒤에 마이페이지에서 채워 넣으면 됩니다.',
  },
  {
    question: '교환학생 인증은 꼭 해야 하나요?',
    answer:
      '자유게시판 읽기와 글쓰기, 스크랩, 가계부, 준비 일정은 인증 없이 쓸 수 있습니다. 중고거래·티켓 양도·동행 등록과 채팅방 개설만 인증이 필요합니다.',
  },
  {
    question: '인증 심사는 얼마나 걸리나요?',
    answer:
      '보통 1~2일 안에 확인합니다. 결과는 인증 화면에서 확인할 수 있고, 거절된 경우 사유를 함께 안내합니다.',
  },
  {
    question: '제출한 서류 이미지는 누가 보나요?',
    answer:
      '심사를 맡은 운영진만 열람합니다. 다른 회원에게는 공개되지 않으며, 주민등록번호나 계좌번호는 가리고 올려주시길 권합니다.',
  },
  {
    question: '동행은 왜 앱 안에서 채팅하지 않나요?',
    answer:
      '동행은 여러 명이 한 번에 이야기하는 경우가 많아 카카오톡 오픈채팅 링크로 연결합니다. 다만 외부 채팅에서 생긴 문제에는 책임지기 어려우니, 선입금을 요구하면 신고해주세요.',
  },
  {
    question: '가계부 금액은 어느 통화로 입력하나요?',
    answer:
      '현지 통화 기준으로 입력해주세요. 파견 국가를 기준으로 통화 기호를 추정해 보여드립니다.',
  },
];

/** 공지는 인증 없이 열리는 엔드포인트라 서버에서 미리 받아 정적으로 내보낸다 */
export async function NoticeAndFaq() {
  const notices = await fetchPublic<NoticeResponse[]>(endpoints.notice.list);
  const recent = Array.isArray(notices) ? notices.slice(0, 4) : [];

  return (
    <Section id="faq" tone="canvas">
      <SectionHeading
        eyebrow="Notice & FAQ"
        title="시작하기 전에 궁금한 것들"
        description="가입 전에 자주 나오는 질문과 최근 공지를 모았습니다."
      />

      <div className="mt-12 grid items-start gap-5 sm:mt-14 lg:grid-cols-[1fr_1.15fr]">
        <Card className="flex flex-col">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="text-h2 text-ink-900">공지사항</h3>
            <Link
              href="/notices"
              className="text-caption font-medium text-brand-600 transition-colors hover:text-brand-700"
            >
              전체 보기
            </Link>
          </div>

          {recent.length === 0 ? (
            <p className="mt-6 text-body text-ink-500">아직 등록된 공지가 없어요.</p>
          ) : (
            <ul className="mt-2 flex flex-col divide-y divide-ink-100">
              {recent.map((notice) => (
                <li key={notice.id}>
                  <Link
                    href={`/notices/${notice.id}`}
                    className="flex items-center justify-between gap-4 py-3.5 transition-colors hover:text-brand-700"
                  >
                    <span className="truncate text-body text-ink-900">{notice.title}</span>
                    <span className="shrink-0 text-caption text-ink-500">
                      {formatDate(notice.createdAt, 'yyyy. M. d.')}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h3 className="text-h2 text-ink-900">자주 묻는 질문</h3>

          <div className="mt-2 flex flex-col divide-y divide-ink-100">
            {FAQ.map((item) => (
              <details key={item.question} className="group py-3.5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-body font-medium text-ink-900">
                  {item.question}
                  <ChevronDown
                    aria-hidden
                    className="size-4 shrink-0 text-ink-500 transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="mt-2 text-body text-ink-500">{item.answer}</p>
              </details>
            ))}
          </div>
        </Card>
      </div>
    </Section>
  );
}
