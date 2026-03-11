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

    // TODO: TESTING MODE - remove before production
    request.user = {
      id: 'test-user-id',
      commerceId: '8730191e-ef09-4ecc-98b8-6f1a3ec5aa6d',
      currentPlan: 'free',
    };
    return true;

    // const authHeader = request.headers.authorization;

    // if (!authHeader?.startsWith('Bearer ')) {
    //   throw new UnauthorizedException('Missing or invalid authorization header');
    // }

    // const token = authHeader.substring(7);

    // const {
    //   data: { user },
    //   error,
    // } = await this.supabase.auth.getUser(token);

    // if (error || !user) {
    //   throw new UnauthorizedException('Invalid or expired token');
    // }

    // // Fetch profile to get commerce_id and current_plan
    // const { data: profile, error: profileError } = await this.supabase
    //   .from('profiles')
    //   .select('commerce_id, current_plan')
    //   .eq('id', user.id)
    //   .single();

    // if (profileError || !profile) {
    //   throw new UnauthorizedException('User profile not found');
    // }

    // request.user = {
    //   id: user.id,
    //   commerceId: profile.commerce_id,
    //   currentPlan: profile.current_plan,
    // };

    // return true;
  }
}
