import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Queue } from 'bull';
import { ArchiveStatus } from '@not-not-found/shared';
import { Archive } from './archive.entity';
import { CreateArchiveDto } from './dto/create-archive.dto';
import { UpdateArchiveDto } from './dto/update-archive.dto';
import { ListArchivesQueryDto } from './dto/list-archives-query.dto';

@Injectable()
export class ArchiveService {
  constructor(
    @InjectRepository(Archive)
    private readonly archiveRepo: Repository<Archive>,
    @InjectQueue('archive')
    private readonly archiveQueue: Queue,
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

    await this.archiveQueue.add('process', {
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

    // Filter by tag in memory (simple-array limitation)
    const filtered = tag ? data.filter((a) => a.tags.includes(tag)) : data;

    return { data: filtered, total, page, limit };
  }

  async findOne(id: string) {
    return this.archiveRepo.findOneOrFail({ where: { id } });
  }

  async update(id: string, dto: UpdateArchiveDto) {
    await this.archiveRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.archiveRepo.delete(id);
  }
}
