import { Module, Global, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PGMQ } from '@baz-scm/pgmq-ts';

export const PGMQ_CLIENT = 'PGMQ_CLIENT';
export const ARCHIVE_QUEUE = 'archive_jobs';

function buildConnectionString(config: ConfigService): string {
  const host = config.get('DATABASE_HOST', 'localhost');
  const port = config.get('DATABASE_PORT', '5432');
  const db = config.get('DATABASE_NAME', 'notnotfound');
  const user = config.get('DATABASE_USER', 'notnotfound');
  const password = config.get('DATABASE_PASSWORD', 'notnotfound');
  return `postgresql://${user}:${password}@${host}:${port}/${db}`;
}

@Global()
@Module({
  providers: [
    {
      provide: PGMQ_CLIENT,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const pgmq = new PGMQ(buildConnectionString(config));
        await pgmq.createSchema();
        await pgmq.createQueue(ARCHIVE_QUEUE);
        return pgmq;
      },
    },
  ],
  exports: [PGMQ_CLIENT],
})
export class QueueModule {
  private readonly logger = new Logger(QueueModule.name);

  constructor() {
    this.logger.log(`Queue "${ARCHIVE_QUEUE}" initialized`);
  }
}
