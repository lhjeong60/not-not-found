/** Mirrored from @not-not-found/shared for build reliability */

export enum ArchiveStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface Archive {
  id: string;
  url: string;
  title: string;
  domain: string;
  status: ArchiveStatus;
  tags: string[];
  category: string | null;
  read: boolean;
  summaryGenerated: boolean;
  storagePath: string | null;
  createdAt: string;
  updatedAt: string;
}

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

export type GetArchiveResponse = Archive & {
  contentUrl: string;
  summaryUrl?: string;
};

export interface UpdateArchiveRequest {
  title?: string;
  tags?: string[];
  category?: string;
  read?: boolean;
}
