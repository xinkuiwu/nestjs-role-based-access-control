import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from 'rxjs';
import { UserService } from "./user/user.service";
import { User } from "./user/entities/user.entity";
import { Role } from "./user/entities/role.entity";
import { Request } from "express";
import { Permission } from "./user/entities/permission.entity";
import { Reflector } from "@nestjs/core";
declare module 'express' {
  interface Request {
    user: {
      username: string;
      roles: Role[]
    }
  }
}
@Injectable()
export class PermissionGuard implements CanActivate {
  @Inject(UserService)
  private userService: UserService

  @Inject(Reflector)
  private reflector: Reflector

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean>  {
    const request: Request = context.switchToHttp().getRequest()

    if(!request.user) {
      return true
    }
    const roles = await this.userService.findRolesByIds(
      request.user.roles.map(item => item.id)
    )
    const permissions: Permission[] = roles.reduce((pre,cur)=>{
      pre.push(...cur.permissions)
      return pre
    },[])

    console.log(permissions);
    const requiredPermissions = this.reflector.getAllAndOverride(
      'require-permission', [
        context.getClass(),
        context.getHandler()
      ]
    )
    console.log(requiredPermissions);
    for (let i=0; i< requiredPermissions.length; i++) {
      const curPermission = requiredPermissions[i]
      const found = permissions.find(item=>item.name === curPermission)
      if(!found) {
        throw new UnauthorizedException('您没有访问该接口的权限')
      }
    }

    return true;
  }
}
