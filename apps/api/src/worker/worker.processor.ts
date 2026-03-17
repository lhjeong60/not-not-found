import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bull';
import { ArchiveStatus } from '@not-not-found/shared';
import { Archive } from '../archive/archive.entity';
import { StorageService } from '../storage/storage.service';
import { CrawlerService } from '../crawler/crawler.service';

interface ArchiveJobData {
  archiveId: string;
  url: string;
  html?: string;
  assets?: string[];
}

@Processor('archive')
export class WorkerProcessor {
  private readonly logger = new Logger(WorkerProcessor.name);

  constructor(
    @InjectRepository(Archive)
    private readonly archiveRepo: Repository<Archive>,
    private readonly storageService: StorageService,
    private readonly crawlerService: CrawlerService,
  ) {}

  @Process('process')
  async handleArchive(job: Job<ArchiveJobData>) {
    const { archiveId, url, html: providedHtml } = job.data;
    this.logger.log(`Processing archive ${archiveId}: ${url}`);

    try {
      await this.archiveRepo.update(archiveId, { status: ArchiveStatus.PROCESSING });

      let html: string;
      let title: string;

      if (providedHtml) {
        html = providedHtml;
        const archive = await this.archiveRepo.findOneBy({ id: archiveId });
        title = archive?.title || '';
      } else {
        const crawled = await this.crawlerService.crawlPage(url);
        html = crawled.html;
        title = crawled.title;
      }

      const storagePath = this.storageService.generateStoragePath(url);

      await this.storageService.uploadHtml(storagePath, html);

      const metadata = {
        url,
        title,
        archived_at: new Date().toISOString(),
        domain: new URL(url).hostname,
        tags: [],
        category: null,
        summary_generated: false,
        read: false,
      };
      await this.storageService.uploadMetadata(storagePath, metadata);

      await this.archiveRepo.update(archiveId, {
        status: ArchiveStatus.COMPLETED,
        storagePath,
        title: title || undefined,
      });

      this.logger.log(`Archive ${archiveId} completed: ${storagePath}`);
    } catch (error) {
      this.logger.error(`Archive ${archiveId} failed: ${error}`);
      await this.archiveRepo.update(archiveId, { status: ArchiveStatus.FAILED });
      throw error;
    }
  }
}
