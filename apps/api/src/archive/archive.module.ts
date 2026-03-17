import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Archive } from './archive.entity';
import { ArchiveService } from './archive.service';
import { ArchiveController } from './archive.controller';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([Archive]), StorageModule],
  controllers: [ArchiveController],
  providers: [ArchiveService],
  exports: [ArchiveService, TypeOrmModule],
})
export class ArchiveModule {}
