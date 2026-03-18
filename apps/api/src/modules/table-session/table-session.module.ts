import { Module, forwardRef } from '@nestjs/common';
import { TableSessionController } from './table-session.controller';
import { TableSessionService } from './table-session.service';
import { TableSessionRepository } from './table-session.repository';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [forwardRef(() => RealtimeModule)],
  controllers: [TableSessionController],
  providers: [TableSessionService, TableSessionRepository],
  exports: [TableSessionService, TableSessionRepository],
})
export class TableSessionModule {}
