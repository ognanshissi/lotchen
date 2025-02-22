import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PERMISSIONS_KEY } from '../decorators';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Get the required permissions from the route metadata
    const requiredPermissions = this.reflector.get<string[]>(
      PERMISSIONS_KEY,
      context.getHandler()
    );
    if (!requiredPermissions) {
      return true; // No permissions required
    }
    // Get the user object from the request
    const request = context.switchToHttp().getRequest();
    const { user } = request; // User is populated from JWT

    if (!user && !user.permissions) {
      throw new ForbiddenException("User don't have required privileges");
    }

    const hasPermissions = requiredPermissions.every((permission) =>
      user.permissions.includes(permission)
    );

    if (!hasPermissions) {
      throw new ForbiddenException("User don't have  enough privileges");
    }
    return true;
  }
}
