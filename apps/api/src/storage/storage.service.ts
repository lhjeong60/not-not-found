import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  CreateBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createHash } from 'crypto';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = config.get('STORAGE_BUCKET', 'archives');
    this.s3 = new S3Client({
      endpoint: config.get('STORAGE_ENDPOINT', 'http://localhost:9000'),
      region: config.get('STORAGE_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: config.get('STORAGE_ACCESS_KEY', 'minioadmin'),
        secretAccessKey: config.get('STORAGE_SECRET_KEY', 'minioadmin'),
      },
      forcePathStyle: true, // required for MinIO
    });
  }

  async onModuleInit() {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`Bucket "${this.bucket}" exists`);
    } catch {
      this.logger.log(`Creating bucket "${this.bucket}"...`);
      await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`Bucket "${this.bucket}" created`);
    }
  }

  generateStoragePath(url: string): string {
    const date = new Date().toISOString().split('T')[0];
    const hash = createHash('sha256').update(url).digest('hex').slice(0, 12);
    return `archive/${date}/${hash}`;
  }

  async uploadHtml(storagePath: string, html: string): Promise<string> {
    const key = `${storagePath}/original.html`;
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: html,
        ContentType: 'text/html; charset=utf-8',
      }),
    );
    return key;
  }

  async uploadMetadata(storagePath: string, metadata: object): Promise<string> {
    const key = `${storagePath}/metadata.json`;
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: JSON.stringify(metadata, null, 2),
        ContentType: 'application/json',
      }),
    );
    return key;
  }

  async uploadAsset(storagePath: string, filename: string, data: Buffer, contentType?: string): Promise<string> {
    const key = `${storagePath}/assets/${filename}`;
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: data,
        ContentType: contentType || 'application/octet-stream',
      }),
    );
    return key;
  }

  async getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.s3, command, { expiresIn });
  }

  async deleteArchive(storagePath: string): Promise<void> {
    const listResult = await this.s3.send(
      new ListObjectsV2Command({ Bucket: this.bucket, Prefix: storagePath }),
    );
    if (!listResult.Contents?.length) return;

    await this.s3.send(
      new DeleteObjectsCommand({
        Bucket: this.bucket,
        Delete: {
          Objects: listResult.Contents.map((obj) => ({ Key: obj.Key })),
        },
      }),
    );
  }
}
