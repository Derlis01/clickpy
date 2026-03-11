import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { SupabaseAuthGuard } from './common/guards/supabase-auth.guard';
import { supabaseConfig } from './common/config/supabase.config';
import { cloudflareConfig } from './common/config/cloudflare.config';
import { CommerceModule } from './modules/commerce/commerce.module';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [supabaseConfig, cloudflareConfig],
    }),
    CommerceModule,
    ProductModule,
    OrderModule,
    UploadModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: SupabaseAuthGuard,
    },
  ],
})
export class AppModule {}
