import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthenticatedRequest } from '../types/authenticated-request';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private supabase: SupabaseClient;

  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {
    this.supabase = createClient(
      this.configService.get<string>('supabase.url')!,
      this.configService.get<string>('supabase.secretKey')!,
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    const token = authHeader.substring(7);

    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Get membership + organization plan
    const { data: membership, error: memberError } = await this.supabase
      .from('organization_members')
      .select('organization_id, role, organizations(plan)')
      .eq('profile_id', user.id)
      .limit(1)
      .single();

    if (memberError || !membership) {
      throw new UnauthorizedException('User has no organization');
    }

    const org = membership.organizations as any;

    // Get main branch
    const { data: branch, error: branchError } = await this.supabase
      .from('branches')
      .select('id')
      .eq('organization_id', membership.organization_id)
      .eq('is_main', true)
      .eq('is_deleted', false)
      .limit(1)
      .single();

    if (branchError || !branch) {
      throw new UnauthorizedException('Organization has no active branch');
    }

    request.user = {
      id: user.id,
      organizationId: membership.organization_id,
      branchId: branch.id,
      plan: org.plan,
      role: membership.role,
    };

    return true;
  }
}
