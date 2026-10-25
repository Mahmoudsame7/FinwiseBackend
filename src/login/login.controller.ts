import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, UseGuards, Req, UsePipes } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginRequestDto, loginSchema } from './dto/loginRequest.dto';
import { RefreshRefreshTokenDto, RefreshRefreshTokenSchema } from 'src/refresh-token/dto/refresh-refresh-token.dto';
import { User } from 'src/Utilities/user.decorator';
import { Refresh } from 'src/Utilities/Guards/refresh.guard';
import { ValidationPipe } from 'src/Utilities/validation.pipe';



@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @HttpCode(200)
  @Post()
  
  create(
    // @Body(new ValidationPipe(loginSchema)) loginDto: LoginRequestDto
  @Body() loginDto: LoginRequestDto
  ) {
    console.log('controller login dto ',loginDto)
    return this.loginService.login(loginDto);
  }

  @HttpCode(200)
  @Post('refresh-token')
  @UseGuards(Refresh)
  
  refreshtoken(@User('userId') userId: string, @Body() refreshTokenDto: RefreshRefreshTokenDto) {
    return this.loginService.refreshToken(userId, refreshTokenDto.refreshToken);
  }

  
}
