import { ShieldCheck } from 'lucide-react';

const COLUMNS = ['블로그', '오픈카톡', 'UNIROAD'];

const ROWS: { label: string; values: string[] }[] = [
  { label: '정보 최신성', values: ['✕', '△', '○'] },
  { label: '기록이 남음', values: ['○', '✕', '○'] },
  { label: '현지 거래', values: ['✕', '○', '○'] },
  { label: '신원 확인', values: ['✕', '✕', '○'] },
  { label: '준비 일정 관리', values: ['✕', '✕', '○'] },
];

const STEPS = [
  { title: '회원가입', description: '아이디와 비밀번호만 있으면 됩니다.' },
  { title: '온보딩', description: '학교와 파견 정보를 알려주세요.' },
  { title: '교환학생 인증', description: '합격 통지서나 파견 확인서를 올려주세요.' },
  { title: '전체 이용', description: '거래·동행·채팅까지 모두 열립니다.' },
];

export function WhyUniroad() {
  return (
    <>
      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <h2 className="text-h1 text-ink-900">왜 UNIROAD인가</h2>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-body">
            <caption className="sr-only">정보를 찾던 기존 방법과 UNIROAD 비교</caption>
            <thead>
              <tr className="border-b border-ink-300">
                <th scope="col" className="px-4 py-3 text-left font-medium text-ink-500">
                  비교 항목
                </th>
                {COLUMNS.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className={`px-4 py-3 text-center font-medium ${
                      column === 'UNIROAD' ? 'text-brand-700' : 'text-ink-500'
                    }`}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="border-b border-ink-100">
                  <th scope="row" className="px-4 py-3 text-left font-normal text-ink-700">
                    {row.label}
                  </th>
                  {row.values.map((value, index) => (
                    <td
                      key={COLUMNS[index]}
                      className={`px-4 py-3 text-center ${
                        index === COLUMNS.length - 1 ? 'font-medium text-brand-700' : 'text-ink-500'
                      }`}
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-caption text-ink-500">
          아직 학교별 데이터가 없는 곳도 있어요. 남겨주신 글이 다음 기수의 자료가 됩니다.
        </p>
      </section>

      <section className="border-y border-ink-100 bg-surface">
        <div className="mx-auto max-w-[1200px] px-6 py-20">
          <h2 className="text-h1 text-ink-900">이용 방법</h2>

          <ol className="mt-8 grid gap-4 sm:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-7 items-center justify-center rounded-full bg-brand-500 text-caption font-medium text-white">
                    {index + 1}
                  </span>
                  <span className="h-px flex-1 bg-ink-100" />
                </div>
                <h3 className="text-body font-medium text-ink-900">{step.title}</h3>
                <p className="text-caption text-ink-500">{step.description}</p>
                <p className="text-caption text-brand-600">
                  {index <= 1 ? '여기까지: 조회 + 자유게시판' : '여기부터: 거래 · 동행 · 채팅'}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="flex flex-col gap-4 rounded-lg border border-brand-100 bg-brand-50 p-8">
          <ShieldCheck aria-hidden className="size-7 text-brand-600" />
          <h2 className="text-h1 text-ink-900">왜 인증이 필요한가요?</h2>
          <p className="max-w-3xl text-body text-ink-700">
            중고거래와 동행은 돈과 만남이 오가는 기능입니다. 파견이 확인된 회원만 글을 올릴 수 있게
            해서, 교환학생이 아닌 사람이 거래글을 올리거나 선입금을 요구하는 상황을 막습니다.
          </p>
          <p className="max-w-3xl text-body text-ink-700">
            합격 통지서, 파견 대학 입학 허가서, 국제처 발급 파견 확인서, 파견교 학생증 중 하나를
            올려주시면 운영진이 확인합니다. 제출한 이미지는 심사 목적으로만 열람하며, 주민등록번호나
            계좌번호는 가려서 올려주세요.
          </p>
        </div>
      </section>
    </>
  );
}
