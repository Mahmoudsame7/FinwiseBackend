
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../RoleDecorator';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class Authorize implements CanActivate {
  constructor(private readonly jwtService: JwtService) {

  }

  

  canActivate(context: ExecutionContext): boolean {

  
    // const roles = this.reflector.get(Roles, context.getHandler());

    // if (!roles) {
    //   return true;
    // }
    const request = context.switchToHttp().getRequest();

    
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      return false;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return false;
    }

    try {
      const decoded = this.jwtService.verify(token, { secret: process.env.JWT_SECRET || 'defaultSecretKey' });
      request.user = decoded;

      
    } catch (err) {
      console.log(err)
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    return true;
  }
}
