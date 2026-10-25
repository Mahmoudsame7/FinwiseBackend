
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../RoleDecorator';
import { JwtService } from '@nestjs/jwt';
import { RefreshRefreshTokenDto, RefreshRefreshTokenSchema } from '../../refresh-token/dto/refresh-refresh-token.dto';


@Injectable()
export class Refresh implements CanActivate {
  constructor(private readonly jwtService: JwtService) {
   
  }

  

  canActivate(context: ExecutionContext): boolean {

    console.log('AuthorizationGuard canActivate called');
    // const roles = this.reflector.get(Roles, context.getHandler());

    // if (!roles) {
    //   return true;
    // }
    const request = context.switchToHttp().getRequest();

    const refreshTokenDto : RefreshRefreshTokenDto = request.body
    const result = RefreshRefreshTokenSchema.safeParse(
      refreshTokenDto
    );

    console.log(result)

    if (!result.success) {
      throw new BadRequestException();
    }

    
 
    try {
      const decoded = this.jwtService.verify(refreshTokenDto.refreshToken, { secret: process.env.JWT_REFRESH_SECRET || 'defaultRefreshSecretKey' });
      request.user = decoded;
    
    } catch (err) {
      console.log(err)
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    return true;
  }
}
