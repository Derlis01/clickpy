import { Request } from 'express';
import type { PlanName } from '../config/plans.config';

export class AuthenticatedUser {
  id: string;
  commerceId: string;
  currentPlan: PlanName;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
