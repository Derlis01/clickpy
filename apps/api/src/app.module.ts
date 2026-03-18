import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { SupabaseAuthGuard } from './common/guards/supabase-auth.guard';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { supabaseConfig } from './common/config/supabase.config';
import { cloudflareConfig } from './common/config/cloudflare.config';
import { CommerceModule } from './modules/commerce/commerce.module';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { UploadModule } from './modules/upload/upload.module';
import { TableModule } from './modules/table/table.module';
import { TableSessionModule } from './modules/table-session/table-session.module';
import { RealtimeModule } from './modules/realtime/realtime.module';

const isProduction = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [supabaseConfig, cloudflareConfig],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: isProduction ? 'info' : 'debug',
        transport: isProduction
          ? undefined // JSON en producción (PM2 captura los logs)
          : { target: 'pino-pretty', options: { colorize: true } },
        autoLogging: false, // Usamos nuestro LoggingInterceptor en vez del auto-logging
        quietReqLogger: true,
      },
    }),
    CommerceModule,
    ProductModule,
    OrderModule,
    UploadModule,
    TableModule,
    TableSessionModule,
    RealtimeModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: SupabaseAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
