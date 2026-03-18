import { Module } from '@nestjs/common';
import { TableController } from './table.controller';
import { TableService } from './table.service';
import { TableRepository } from './table.repository';

@Module({
  controllers: [TableController],
  providers: [TableService, TableRepository],
  exports: [TableService, TableRepository],
})
export class TableModule {}
