import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Res,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { ArchiveService } from './archive.service';
import { CreateArchiveDto } from './dto/create-archive.dto';
import { UpdateArchiveDto } from './dto/update-archive.dto';
import { ListArchivesQueryDto } from './dto/list-archives-query.dto';

@Controller('archives')
export class ArchiveController {
  constructor(private readonly archiveService: ArchiveService) {}

  @Post()
  create(@Body() dto: CreateArchiveDto) {
    return this.archiveService.create(dto);
  }

  @Get()
  findAll(@Query() query: ListArchivesQueryDto) {
    return this.archiveService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.archiveService.findOne(id);
  }

  @Get(':id/content')
  async getContent(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const html = await this.archiveService.getContent(id);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateArchiveDto,
  ) {
    return this.archiveService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.archiveService.remove(id);
  }
}
