import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ArchiveStatus } from '@not-not-found/shared';

@Entity('archives')
export class Archive {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column({ default: '' })
  title: string;

  @Column({ default: '' })
  domain: string;

  @Column({ type: 'enum', enum: ArchiveStatus, default: ArchiveStatus.PENDING })
  status: ArchiveStatus;

  @Column('simple-array', { default: '' })
  tags: string[];

  @Column({ type: 'varchar', nullable: true })
  category: string | null;

  @Column({ default: false })
  read: boolean;

  @Column({ default: false })
  summaryGenerated: boolean;

  @Column({ type: 'varchar', nullable: true })
  storagePath: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
