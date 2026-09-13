/**
 * 구조화 데이터(JSON-LD)를 심는다.
 *
 * 검색엔진은 본문을 읽어 "이게 기사인지, 질문 목록인지"를 추측하지만,
 * 여기에 명시해 두면 추측 없이 읽고 검색결과에 FAQ 아코디언·발행일 같은 걸 붙여준다.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON 안의 '<'를 그대로 두면 본문에 </script>가 섞였을 때 태그가 일찍 닫힌다
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
