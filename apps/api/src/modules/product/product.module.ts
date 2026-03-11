import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductRepository } from './product.repository';
import { CommerceModule } from '../commerce/commerce.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [CommerceModule, UploadModule],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository],
  exports: [ProductService],
})
export class ProductModule {}
