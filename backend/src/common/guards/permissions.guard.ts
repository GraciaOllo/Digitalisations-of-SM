import {
  CanActivate, ExecutionContext, ForbiddenException, Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { UserRole } from '../constants/roles.constant';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required?.length) return true;

    const user = context.switchToHttp().getRequest().user;
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.OWNER) {
      return true;
    }

    const granted = user.permissions || [];
    if (required.every(p => granted.includes(p))) return true;
    throw new ForbiddenException('Insufficient permissions');
  }
}
