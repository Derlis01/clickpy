import { Module } from '@nestjs/common';
import { CommerceController } from './commerce.controller';
import { CommerceService } from './commerce.service';
import { CommerceRepository } from './commerce.repository';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [CommerceController],
  providers: [CommerceService, CommerceRepository],
  exports: [CommerceService, CommerceRepository],
})
export class CommerceModule {}
