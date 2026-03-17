import { Archive, ArchiveStatus } from './archive';

// POST /api/archives — Extension에서 호출
export interface CreateArchiveRequest {
  url: string;
  title: string;
  html?: string;       // Extension DOM 캡처 결과 (없으면 서버 Puppeteer fallback)
  assets?: string[];   // 인라인화된 에셋 base64 (선택)
}

export interface CreateArchiveResponse {
  id: string;
  status: ArchiveStatus;
  message: string;
}

// GET /api/archives — 목록 조회
export interface ListArchivesQuery {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  read?: boolean;
  search?: string;
}

export interface ListArchivesResponse {
  data: Archive[];
  total: number;
  page: number;
  limit: number;
}

// GET /api/archives/:id
export type GetArchiveResponse = Archive & {
  contentUrl: string;     // 원문 HTML 접근 URL (presigned)
  summaryUrl?: string;    // 요약본 URL
};

// PATCH /api/archives/:id
export interface UpdateArchiveRequest {
  title?: string;
  tags?: string[];
  category?: string;
  read?: boolean;
}
