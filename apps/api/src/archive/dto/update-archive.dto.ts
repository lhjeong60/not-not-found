import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class UpdateArchiveDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  read?: boolean;
}
