import { UserRole } from '../constants/roles.constant';

export interface JwtPayload {
  sub: string;
  companyId: string;
  email: string;
  role: UserRole;
  permissions: string[];
  type: 'access' | 'refresh';
}
