import { IsString, IsUrl, IsOptional, IsArray } from 'class-validator';

export class CreateArchiveDto {
  @IsUrl()
  url: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  html?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assets?: string[];
}
