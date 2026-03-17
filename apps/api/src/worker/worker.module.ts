import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Archive } from '../archive/archive.entity';
import { StorageModule } from '../storage/storage.module';
import { CrawlerModule } from '../crawler/crawler.module';
import { WorkerProcessor } from './worker.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Archive]),
    BullModule.registerQueue({ name: 'archive' }),
    StorageModule,
    CrawlerModule,
  ],
  providers: [WorkerProcessor],
})
export class WorkerModule {}
