import { Request } from 'express';
import type { PlanName } from '../config/plans.config';

export class AuthenticatedUser {
  id: string;
  organizationId: string;
  branchId: string;
  plan: PlanName;
  role: 'owner' | 'admin' | 'staff';
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
