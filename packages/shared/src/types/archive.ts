export enum ArchiveStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface ArchiveMetadata {
  url: string;
  title: string;
  archivedAt: string;
  domain: string;
  tags: string[];
  category: string | null;
  summaryGenerated: boolean;
  read: boolean;
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
