import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { PGMQ } from '@baz-scm/pgmq-ts';
import { ArchiveStatus } from '@not-not-found/shared';
import { Archive } from './archive.entity';
import { CreateArchiveDto } from './dto/create-archive.dto';
import { UpdateArchiveDto } from './dto/update-archive.dto';
import { ListArchivesQueryDto } from './dto/list-archives-query.dto';
import { PGMQ_CLIENT, ARCHIVE_QUEUE } from '../queue/queue.module';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class ArchiveService {
  constructor(
    @InjectRepository(Archive)
    private readonly archiveRepo: Repository<Archive>,
    @Inject(PGMQ_CLIENT)
    private readonly pgmq: InstanceType<typeof PGMQ>,
    private readonly storageService: StorageService,
  ) {}

  async create(dto: CreateArchiveDto) {
    const domain = new URL(dto.url).hostname;
    const archive = this.archiveRepo.create({
      url: dto.url,
      title: dto.title,
      domain,
      status: ArchiveStatus.PENDING,
    });
    const saved = await this.archiveRepo.save(archive);

    await this.pgmq.sendMessage(ARCHIVE_QUEUE, {
      archiveId: saved.id,
      url: dto.url,
      html: dto.html,
      assets: dto.assets,
    });

    return { id: saved.id, status: saved.status, message: 'Archive queued for processing' };
  }

  async findAll(query: ListArchivesQueryDto) {
    const { page = 1, limit = 20, category, tag, read, search } = query;
    const where: FindOptionsWhere<Archive> = {};

    if (category) where.category = category;
    if (read !== undefined) where.read = read;
    if (search) where.title = Like(`%${search}%`);

    const [data, total] = await this.archiveRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const filtered = tag ? data.filter((a) => a.tags.includes(tag)) : data;

    return { data: filtered, total, page, limit };
  }

  async findOne(id: string) {
    const archive = await this.archiveRepo.findOneOrFail({ where: { id } });
    let contentUrl: string | undefined;
    let summaryUrl: string | undefined;

    if (archive.storagePath) {
      contentUrl = `/api/archives/${id}/content`;
    }

    return { ...archive, contentUrl, summaryUrl };
  }

  async getContent(id: string): Promise<string> {
    const archive = await this.archiveRepo.findOneOrFail({ where: { id } });
    if (!archive.storagePath) throw new Error('No content available');

    const html = await this.storageService.getObject(
      `${archive.storagePath}/original.html`,
    );

    // 링크 비활성화 + 스크립트 제거 CSS/JS 주입
    const injection = `
<style>
  a { pointer-events: none !important; cursor: default !important; color: inherit !important; text-decoration: none !important; }
  form { pointer-events: none !important; }
</style>
<script>
  document.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); }, true);
</script>`;

    // </head> 앞에 주입, 없으면 맨 앞에
    if (html.includes('</head>')) {
      return html.replace('</head>', injection + '</head>');
    }
    return injection + html;
  }

  async update(id: string, dto: UpdateArchiveDto) {
    await this.archiveRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.archiveRepo.delete(id);
  }
}
