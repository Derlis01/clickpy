import { Module, forwardRef } from '@nestjs/common';
import { TableSessionModule } from '../table-session/table-session.module';
import { RealtimeGateway } from './realtime.gateway';
import { SessionStateManager } from './session-state.manager';
import { CountdownManager } from './countdown.manager';
import { SessionLockService } from './session-lock.service';
import { RealtimeBroadcasterService } from './realtime-broadcaster.service';
import { RealtimeBroadcaster } from '../table-session/realtime-broadcaster.interface';

@Module({
  imports: [forwardRef(() => TableSessionModule)],
  providers: [
    RealtimeGateway,
    SessionStateManager,
    CountdownManager,
    SessionLockService,
    RealtimeBroadcasterService,
    {
      provide: RealtimeBroadcaster,
      useExisting: RealtimeBroadcasterService,
    },
  ],
  exports: [SessionStateManager, RealtimeBroadcaster, RealtimeGateway],
})
export class RealtimeModule {}
