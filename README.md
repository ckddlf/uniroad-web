# UIROAD Web

교환학생 커뮤니티 UIROAD의 웹 프론트엔드. Next.js 15 App Router + React 19 + TypeScript.

## 실행

```bash
npm install
cp .env.example .env.local
npm run dev      # http://localhost:3000
npm run build    # 배포 전 반드시 통과시킬 것
```

## 환경 변수

| 키 | 값 | 설명 |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | `/backend` | 브라우저가 호출할 API base. 프록시 경로다. |
| `BACKEND_ORIGIN` | `http://api.uniroad.kr` | Next 서버가 중계할 실제 백엔드 origin (서버 전용) |

백엔드는 현재 HTTPS를 제공하지 않고(443 포트 미개방) CORS 허용 origin도 제한되어 있어,
브라우저에서 직접 호출하면 mixed content로 차단된다. `next.config.ts`의 rewrites가
`/backend/*` 요청을 서버 사이드에서 백엔드로 중계해 이 문제를 우회한다.
백엔드가 HTTPS + CORS를 지원하게 되면 `NEXT_PUBLIC_API_BASE_URL`만 바꿔 프록시를 끌 수 있다.

## 로컬 백엔드로 개발하기

운영 DB에 테스트 데이터를 남기지 않으려면 저장소의 백엔드를 로컬에서 띄우고
`.env.local`의 `BACKEND_ORIGIN`을 `http://localhost:8080`으로 둔다. H2 파일 DB를 쓰기 때문에
외부 DB 없이 뜨고, `local` 프로필은 ADMIN 권한의 개발 계정(`localtest` / `Local1234`)을 만든다.

```powershell
cd C:\uniroad\backend
$env:GRADLE_USER_HOME = Join-Path $env:LOCALAPPDATA 'Gradle'
.\gradlew.bat bootRun --no-daemon --console=plain `
  "--args=--cors.allowed-origins=http://localhost:3000,http://127.0.0.1:3000 --spring.security.oauth2.client.registration.google.client-id=local-dummy --spring.security.oauth2.client.registration.google.client-secret=local-dummy"
```

`--args` 두 개는 `local` 프로필이 그대로는 뜨지 않아 필요하다(백엔드 코드는 고치지 않는다).

- `cors.allowed-origins`가 `application-local.yml`에 YAML 목록으로 정의돼 있는데
  `SecurityConfig`는 `@Value("${cors.allowed-origins}")`로 읽어서 플레이스홀더가 해석되지 않는다.
  운영 프로필은 쉼표로 이어진 문자열이라 문제가 없다.
- `local` 프로필에 OAuth2 클라이언트 등록이 없는데 `SecurityConfig`는 `oauth2Login`을 항상 켜서
  `ClientRegistrationRepository` 빈이 없다고 실패한다.

## 폴더 구조

```
src/
├─ app/          라우트 파일(page/layout/loading/error)만 둔다
├─ shared/       api 클라이언트·타입·공통 UI·유틸
├─ entities/     도메인 타입과 표시용 매퍼
├─ features/     도메인별 query/mutation 훅과 폼
└─ widgets/      헤더·대시보드 위젯 등 조합 단위
```

## 개발 중 임시 페이지

- `/ui-kit` — 공통 컴포넌트 확인용. **STEP 12에서 삭제한다.**
  (App Router는 `_`로 시작하는 폴더를 라우팅에서 제외하므로 `_ui` 대신 이 경로를 쓴다.)
