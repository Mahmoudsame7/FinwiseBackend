import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { UsersController } from './user.controller';
import { UsersRepository } from './user.repository';
import { UsersService } from './user.service';

import { RefreshTokenModule } from 'src/refresh-token/refresh-token.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AuthModule,
    RefreshTokenModule
  ],

  controllers: [
    UsersController,
  ],

  providers: [
    UsersService,
    UsersRepository,
  ],

  exports: [
    UsersService,
  ],
})
export class UsersModule {}