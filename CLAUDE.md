# notnotfound

> 404가 되기 전에, 내가 지킨다.

나만의 디지털 알렉산드리아 도서관. 관심 있는 웹 콘텐츠가 사라지기 전에 원문 그대로 보존하는 개인 웹 아카이브 도구.

---

## 핵심 원칙

1. **원문 보존이 제1원칙** — HTML + 이미지/CSS 등 에셋을 통째로 저장. 원본이 사라져도 내 아카이브에는 남아있어야 한다.
2. **요약 및 모바일 열람은 부가 기능** — 보존된 원문을 기반으로 LLM 요약본 생성, 모바일에서 편하게 읽을 수 있게 제공.
3. **개인 도구 우선** — 저작권 이슈 회피를 위해 개인 사적 복제 범위 내에서 시작. 서비스 확장 시 공유되는 것은 메타데이터/분석 결과뿐.

---

## 타겟 유저

- 컴퓨터 앞에서 대부분의 시간을 보내는 직장인
- 업무 중 발견한 좋은 글을 읽을 시간이 없어 나중에 모바일에서 읽고 싶은 사람
- 북마크해둔 글이 404가 되는 경험에 좌절한 사람

---

## 로드맵

### Phase 1: MVP — 개인 아카이브 도구
- 크롬 익스텐션으로 원클릭 저장 (DOM 직접 캡처 — 로그인 필요 페이지 대응)
- NestJS 백엔드 + Bull Queue로 아카이빙 파이프라인 (Puppeteer는 fallback)
- S3/R2 저장소에 업로드
- 도서관 컨셉 UI로 아카이브 열람 (React 웹 + React Native 모바일 열람 전용)

### Phase 2: 스크랩 통계 대시보드
- 저장한 아티클의 카테고리/태그 자동 분류
- 내 취향 시각화 (주제 비율, 시간별 관심사 변화 등)
- 읽기 현황 트래킹

### Phase 3: 소셜 프로필 & 성격 분석
- 스크랩 데이터 기반 취향/성격 유형 분석 (LLM 활용)
- 프로필 공유 기능 (공유되는 건 분석 결과뿐, 원문 아님 → 저작권 클린)
- 커뮤니티 비교 ("상위 N% 테크 덕후" 등)

---

## 기술 스택

| 구성 요소 | 기술 | 비고 |
|-----------|------|------|
| 모노레포 | Turborepo + pnpm | 워크스페이스 관리 |
| 입력 | Chrome Extension (Manifest V3) | DOM 직접 캡처 (SingleFile 방식) |
| 백엔드 | NestJS + Bull Queue | 아카이빙 파이프라인, Redis 기반 작업 큐 |
| DB | PostgreSQL | 메타데이터 저장 |
| 웹 스크래핑 | Puppeteer (fallback) | Extension 캡처 실패 시 서버 크롤링 |
| LLM 요약 | Gemini API (무료 티어) / Claude API | 온디맨드 또는 배치 |
| 저장소 | Oracle Object Storage (무료) / Cloudflare R2 | 장기 보관 시 S3 Glacier 고려 |
| 웹 UI | React (Vite + Tailwind) | 도서관 컨셉, 다크모드 지원 |
| 모바일 | React Native (Expo) | 열람 전용 |
| 인프라 | Oracle Cloud (Always Free) | API + DB + Redis |

---

## 저장 구조

```
/archive/{YYYY-MM-DD}/{url-hash}/
  ├── original.html          # 원문 HTML 전체
  ├── assets/                 # 이미지, CSS, 폰트 등 로컬 복사본
  ├── metadata.json           # URL, 수집일, 제목, 태그, 카테고리
  ├── summary.html            # 모바일 열람용 요약본 (Phase 1에서는 선택)
  └── snapshot.mhtml          # 단일 파일 스냅샷 (보험용)
```

### metadata.json 스키마

```json
{
  "url": "https://example.com/article",
  "title": "아티클 제목",
  "archived_at": "2026-03-17T09:00:00Z",
  "domain": "example.com",
  "tags": [],
  "category": null,
  "summary_generated": false,
  "read": false
}
```

---

## Phase 1 MVP 상세

### 1. Chrome Extension (DOM 직접 캡처)

- 브라우저 툴바 아이콘 클릭 → Content Script가 현재 페이지 DOM 풀 캡처
- SingleFile 방식: HTML + 이미지/CSS/폰트를 인라인화하여 단일 HTML로 변환
- 캡처된 데이터를 NestJS 백엔드 API로 POST
- 로그인 필요 페이지도 사용자가 이미 로그인한 상태이므로 캡처 가능
- 저장 완료 시 뱃지/토스트 알림
- 캡처 실패 시 URL만 전송 (서버 Puppeteer fallback)
- 향후: 태그 입력, 메모 추가 등 확장

### 2. NestJS 아카이빙 파이프라인

```
[Extension POST /api/archives]
  → URL 유효성 검증
  → DB에 status='processing' 저장
  → Bull Queue에 작업 추가 → 즉시 응답

[Bull Worker - 비동기]
  → Extension이 보낸 HTML + assets 저장소 업로드
  → (또는 fallback) Puppeteer 서버 크롤링
  → metadata.json 생성
  → 저장소 업로드 (/{date}/{hash}/ 구조)
  → (선택) LLM 요약 생성 → summary.html 업로드
  → DB status='completed' 업데이트
```

### 3. 열람 인터페이스 — 도서관 컨셉

- **"나의 디지털 도서관"**: 아카이브 하나 = 책 한 권
- 책장(bookshelf) 레이아웃: 나무 선반 위에 책등(spine)이 나란히 꽂힌 비주얼
- 책등에 제목 + 도메인 favicon + 날짜 표시
- 읽은 책 / 안 읽은 책 시각적 구분
- 책 클릭 시 펼쳐지는 애니메이션 → 원문 열람
- 카테고리/태그별 서가 분류
- 모바일 퍼스트 반응형, 다크모드 (밤의 도서관 무드)
- React 웹 + React Native 모바일 (열람 전용)

---

## 비용 예상 (월간)

| 항목 | 예상 비용 | 비고 |
|------|----------|------|
| 인프라 (Oracle Cloud) | $0 | Always Free 티어 |
| 저장소 (10GB 이하) | $0 | Oracle Object Storage 무료 / R2 |
| LLM 요약 (Gemini 무료) | $0 | 무료 티어 한도 내 |
| LLM 요약 (Claude, 1000건) | ~$10-30 | Sonnet 기준 |
| 총 예상 | **$0 ~ $30** | 요약 LLM 선택에 따라 |

---

## 저작권 전략

- Phase 1-2: **개인 사적 복제** (한국 저작권법 제30조) — 나만 사용하는 개인 도구
- Phase 3 공유 시: 원문은 공유하지 않음. 공유 대상은 메타데이터 기반 분석 결과뿐
- 요약본 공개 시: 요약 + 원문 링크 구조, 원문 전체 노출 금지

---

## 개발 우선순위 (Phase 1)

1. 모노레포 초기 설정 (Turborepo + pnpm + 공유 패키지)
2. NestJS 백엔드 기본 구조 (Archive CRUD + Bull Queue + PostgreSQL)
3. 크롤러 서비스 (Puppeteer fallback + Bull Worker)
4. 저장소 연동 (S3 호환 — Oracle Object Storage / R2 / MinIO)
5. Chrome Extension MVP (DOM 직접 캡처)
6. React 웹 UI (도서관 컨셉 책장 레이아웃)
7. React Native 모바일 (열람 전용)
8. (선택) LLM 요약 파이프라인

---

## 참고

- 프로젝트명 유래: 404 Not Found의 이중부정. "여기선 사라지지 않는다."
- 영감: 관심 있던 웹 콘텐츠가 사라지는 것에 대한 두려움
- 유사 서비스 참고: Pocket, Instapaper, Wallabag, ArchiveBox
