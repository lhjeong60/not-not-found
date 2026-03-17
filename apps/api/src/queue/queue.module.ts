import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'archive' }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
