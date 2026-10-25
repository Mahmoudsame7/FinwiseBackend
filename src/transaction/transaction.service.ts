import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto, CreateTransactionSchema, GetTransactionDto, GetTransactionSummaryDto, SearchTransactionsDto, TransactionPeriod, UpdateTransactionDto } from './dto/create-transaction.dto';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { DataSource } from 'typeorm';
import { Account } from '../account/entities/account.entity';
import { TransactionRepository } from './transaction.repository';
import { GoogleGenAI, Type } from '@google/genai';


@Injectable()
export class TransactionService {

  constructor(
    private readonly transactionRepository:TransactionRepository, private readonly dataSource: DataSource) { }

  async create(userId: string, dto: CreateTransactionDto) {
    return this.dataSource.transaction(async (manager) => {

      // 1. Get account and verify ownership
      const account = await manager.findOne(Account, {
        where: {
          id: dto.accountId,
          userId,
        },
      });

      if (!account) {
        throw new NotFoundException('Account not found');
      }

      // 2. Update account balance
      if (dto.type === TransactionType.EXPENSE) {
        account.balance -= dto.amount;
      } else {
        account.balance += dto.amount;
      }

      await manager.save(Account, account);

      // 3. Create transaction
      const transaction = manager.create(Transaction, {
        ...dto,
      });

      await manager.save(Transaction, transaction);

      return transaction;
    });


  }


  


  findAll(userId:string) {
    return this.transactionRepository.findAll(userId)
  }

  async findOne(userId: string, transactionId: string) {
    const transaction  = await this.transactionRepository.findOne(userId,transactionId)

    if(!transaction){
      throw new NotFoundException("Transaction not found")
    }

    return transaction
  }

  async findByAccount(userId: string, accountId: string) {
    const res = await this.transactionRepository.findByAccount(userId,accountId)

    console.log(res)

    return res
  }

   async findAllSummary(
  userId: string
) {
  return this.transactionRepository.findAllPeriodSummary(userId)

}

  async findYearSummary(
  userId: string
) {
  return this.transactionRepository.findYearPeriodSummary(userId)

}

  async findMonthSummary(
  userId: string
) {
  return this.transactionRepository.findMonthPeriodSummary(userId)

}

  async findWeekSummary(
  userId: string
) {
  return this.transactionRepository.findWeekPeriodSummary(userId)

}

  async findByPeriod(
  userId: string,
  dto: GetTransactionDto,
) {
  

  return this.transactionRepository.findByPeriod(
    userId,
    dto
  );
}

async searchTransactions(
  userId: string,
  dto: SearchTransactionsDto,
) {
  

  return this.transactionRepository.searchTransactions(
    userId,
    dto
  );
}

  async update(
    userId: string,
    transactionId: string,
    dto: UpdateTransactionDto,
  ) {
    return this.dataSource.transaction(async (manager) => {

      // 1. Get existing transaction
      const transaction = await manager.findOne(Transaction, {
        where: {
          id: transactionId,
        },
      });

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      // 2. Get current account and verify ownership
      const oldAccount = await manager.findOne(Account, {
        where: {
          id: transaction.accountId,
          userId,
        },
      });

      if (!oldAccount) {
        throw new NotFoundException(
          'Current transaction account not found',
        );
      }

      // 3. Determine new values
      const newAccountId = dto.accountId ?? transaction.accountId;
      const newAmount = dto.amount ?? transaction.amount;
      const newType = dto.type ?? transaction.type;

      // 4. Get new account
      let newAccount = oldAccount;

      if (newAccountId !== oldAccount.id) {
        newAccount = await manager.findOne(Account, {
          where: {
            id: newAccountId,
            userId,
          },
        });

        if (!newAccount) {
          throw new NotFoundException(
            'New transaction account not found',
          );
        }
      }

      // 5. Reverse old transaction from old account
      if (transaction.type === TransactionType.EXPENSE) {
        oldAccount.balance += transaction.amount;
      } else {
        oldAccount.balance -= transaction.amount;
      }

      // 6. Apply new transaction to new account
      if (newType === TransactionType.EXPENSE) {
        newAccount.balance -= newAmount;
      } else {
        newAccount.balance += newAmount;
      }

      // 7. Save accounts
      await manager.save(Account, oldAccount);

      if (newAccount.id !== oldAccount.id) {
        await manager.save(Account, newAccount);
      }

      // 8. Update transaction
      Object.assign(transaction, dto);

      await manager.save(Transaction, transaction);

      return transaction;
    });
  }

  async remove(userId: string, transactionId: string) {
    return this.dataSource.transaction(async (manager) => {
      const transaction = await manager.findOne(Transaction, {
        where: {
          id: transactionId,
        }
      });


      console.log('transaction with account data', transaction)

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      // Verify ownership through account
      const account = await manager.findOne(Account, {
        where: {
          id: transaction.accountId,
          userId,
        },
      });

      if (!account) {
        throw new NotFoundException('Account not found');
      }

      // 1. Reverse old transaction
      if (transaction.type === TransactionType.EXPENSE) {
        account.balance += transaction.amount;
      } else {
        account.balance -= transaction.amount;
      }



      // 3. Update account
      await manager.save(Account, account);


      await manager.delete(Transaction, transactionId);


      return transaction;
    });
  }
}
