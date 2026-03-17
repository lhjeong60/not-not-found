import type {
  Archive,
  ListArchivesQuery,
  ListArchivesResponse,
  GetArchiveResponse,
  UpdateArchiveRequest,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new ApiError(res.status, body || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

function toQueryString(params: Record<string, unknown>): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== '',
  );
  if (entries.length === 0) return '';
  const qs = new URLSearchParams(
    entries.map(([k, v]) => [k, String(v)]),
  ).toString();
  return `?${qs}`;
}

export async function getArchives(
  query: ListArchivesQuery = {},
): Promise<ListArchivesResponse> {
  return request<ListArchivesResponse>(
    `/api/archives${toQueryString(query as Record<string, unknown>)}`,
  );
}

export async function getArchive(id: string): Promise<GetArchiveResponse> {
  return request<GetArchiveResponse>(`/api/archives/${id}`);
}

export async function updateArchive(
  id: string,
  data: UpdateArchiveRequest,
): Promise<Archive> {
  return request<Archive>(`/api/archives/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteArchive(id: string): Promise<void> {
  return request<void>(`/api/archives/${id}`, { method: 'DELETE' });
}

export { ApiError };
