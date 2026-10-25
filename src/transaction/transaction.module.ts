import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { JwtModule } from '@nestjs/jwt';
import { AccountModule } from 'src/account/account.module';
import { TransactionRepository } from './transaction.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    JwtModule
  ],
  controllers: [TransactionController],
  providers: [TransactionService,TransactionRepository],
  exports: [TransactionService,TransactionRepository]
})
export class TransactionModule {}
