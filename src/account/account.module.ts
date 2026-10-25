import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/user/user.module';
import { AccountRepository } from './account.repository';
import { TransactionModule } from 'src/transaction/transaction.module';

@Module({
  imports: [
      TypeOrmModule.forFeature([Account]),
      AuthModule,
      UsersModule,
      TransactionModule
    ],
  controllers: [AccountController],
  providers: [AccountService,AccountRepository],
  exports: [AccountService,AccountRepository]
})
export class AccountModule {}
