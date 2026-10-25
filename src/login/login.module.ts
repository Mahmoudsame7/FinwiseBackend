import { Module } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';
import { UsersModule } from 'src/user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { RefreshTokenModule } from 'src/refresh-token/refresh-token.module';
import { AuthModule } from 'src/auth/auth.module';


@Module({
  imports: [
    UsersModule,
    RefreshTokenModule,
    AuthModule
    
  ],
  controllers: [LoginController],
  providers: [LoginService],
})
export class LoginModule {}
