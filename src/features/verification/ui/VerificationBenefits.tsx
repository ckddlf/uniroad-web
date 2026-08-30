import { Check, Minus } from 'lucide-react';

const ROWS: { label: string; user: boolean }[] = [
  { label: '게시글·거래글 둘러보기', user: true },
  { label: '자유게시판 글쓰기 · 댓글 · 좋아요', user: true },
  { label: '스크랩 · 가계부 · 준비 일정 체크리스트', user: true },
  { label: '중고거래 등록', user: false },
  { label: '티켓 양도 등록', user: false },
  { label: '동행 등록', user: false },
  { label: '채팅방 만들기', user: false },
  { label: '프로필 인증 뱃지', user: false },
];

/** 인증하면 무엇이 달라지는지 한눈에 보여준다 */
export function VerificationBenefits() {
  return (
    <section>
      <h2 className="text-h2 text-ink-900">인증하면 달라지는 것</h2>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-body">
          <thead>
            <tr className="border-b border-ink-300">
              <th scope="col" className="px-4 py-3 text-left font-medium text-ink-500">
                기능
              </th>
              <th scope="col" className="px-4 py-3 text-center font-medium text-ink-500">
                인증 전
              </th>
              <th scope="col" className="px-4 py-3 text-center font-medium text-brand-700">
                인증 후
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label} className="border-b border-ink-100">
                <th scope="row" className="px-4 py-3 text-left font-normal text-ink-700">
                  {row.label}
                </th>
                <td className="px-4 py-3 text-center">
                  {row.user ? (
                    <Check aria-label="가능" className="mx-auto size-4 text-ink-500" />
                  ) : (
                    <Minus aria-label="불가" className="mx-auto size-4 text-ink-300" />
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <Check aria-label="가능" className="mx-auto size-4 text-brand-600" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
