# Not Not Found

> 404가 되기 전에, 내가 지킨다.

나만의 디지털 알렉산드리아 도서관. 관심 있는 웹 콘텐츠가 사라지기 전에 원문 그대로 보존하는 개인 웹 아카이브 도구.

## 구조

```
apps/
  api/          NestJS 백엔드 (Archive CRUD, pgmq 큐, Puppeteer 크롤러)
  web/          React 웹 UI (도서관 컨셉 책장 레이아웃)
  extension/    Chrome Extension (DOM 캡처 → API 전송)
packages/
  shared/       공유 타입 (Archive, API 인터페이스)
```

## 기술 스택

| 구성 | 기술 |
|------|------|
| 모노레포 | Turborepo + pnpm |
| 백엔드 | NestJS + TypeORM + PostgreSQL |
| 메시지 큐 | pgmq (PostgreSQL extension) |
| 저장소 | S3 호환 (MinIO / R2) |
| 크롤러 | Puppeteer (fallback) |
| 웹 UI | React + Vite + Tailwind CSS |
| 익스텐션 | Chrome Manifest V3 + @crxjs/vite-plugin |
| 리버스 프록시 | Caddy (자동 HTTPS) |

## 로컬 개발

```bash
# 인프라 (PostgreSQL + MinIO)
docker-compose up -d

# pgmq extension 활성화 (최초 1회)
docker exec not-not-found-postgres-1 psql -U notnotfound -d notnotfound -c "CREATE EXTENSION IF NOT EXISTS pgmq;"

# 의존성 설치 + shared 빌드
pnpm install
pnpm --filter @not-not-found/shared build

# API 서버 (localhost:8080)
pnpm --filter @not-not-found/api dev

# 웹 UI (localhost:5173)
pnpm --filter @not-not-found/web dev

# Extension 빌드
pnpm --filter @not-not-found/extension build
# → chrome://extensions 에서 apps/extension/dist 로드
```

## 환경변수

`.env.example` 참고. 로컬 개발 시 기본값으로 동작.

```bash
cp .env.example .env
```

## 프로덕션 배포 (EC2)

```bash
docker-compose -f docker-compose.prod.yml up -d
```

Caddy가 자동 HTTPS 처리. `DOMAIN` 환경변수로 도메인 설정.

## 라이선스

Private — 개인 사적 복제 용도
