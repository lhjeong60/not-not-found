import { Injectable, Inject, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PGMQ } from '@baz-scm/pgmq-ts';
import { ArchiveStatus } from '@not-not-found/shared';
import { Archive } from '../archive/archive.entity';
import { StorageService } from '../storage/storage.service';
import { CrawlerService } from '../crawler/crawler.service';
import { PGMQ_CLIENT, ARCHIVE_QUEUE } from '../queue/queue.module';

interface ArchiveJobData {
  archiveId: string;
  url: string;
  html?: string;
  assets?: string[];
}

@Injectable()
export class WorkerProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WorkerProcessor.name);
  private running = false;
  private pollTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    @InjectRepository(Archive)
    private readonly archiveRepo: Repository<Archive>,
    @Inject(PGMQ_CLIENT)
    private readonly pgmq: InstanceType<typeof PGMQ>,
    private readonly storageService: StorageService,
    private readonly crawlerService: CrawlerService,
  ) {}

  onModuleInit() {
    this.running = true;
    this.poll();
    this.logger.log('Archive worker started');
  }

  onModuleDestroy() {
    this.running = false;
    if (this.pollTimer) clearTimeout(this.pollTimer);
  }

  private async poll() {
    if (!this.running) return;

    try {
      // Read message with 30s visibility timeout
      const msg = await this.pgmq.readMessage<ArchiveJobData>(ARCHIVE_QUEUE, 30);

      if (msg) {
        await this.handleArchive(msg.message, msg.msgId);
      }
    } catch (error) {
      this.logger.error(`Poll error: ${error}`);
    }

    this.pollTimer = setTimeout(() => this.poll(), 1000);
  }

  private async handleArchive(data: ArchiveJobData, msgId: number) {
    const { archiveId, url, html: providedHtml } = data;
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

      await this.pgmq.deleteMessage(ARCHIVE_QUEUE, msgId);
      this.logger.log(`Archive ${archiveId} completed: ${storagePath}`);
    } catch (error) {
      this.logger.error(`Archive ${archiveId} failed: ${error}`);
      await this.archiveRepo.update(archiveId, { status: ArchiveStatus.FAILED });
      // Message becomes visible again after visibility timeout (auto-retry)
    }
  }
}
