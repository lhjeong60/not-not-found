import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Archive } from './archive.entity';
import { ArchiveService } from './archive.service';
import { ArchiveController } from './archive.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Archive]),
    BullModule.registerQueue({ name: 'archive' }),
  ],
  controllers: [ArchiveController],
  providers: [ArchiveService],
  exports: [ArchiveService, TypeOrmModule],
})
export class ArchiveModule {}
