import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAccountDto, UpdateAccountDto } from './dto/create-account.dto';
import { UsersService } from 'src/user/user.service';
import { AccountRepository } from './account.repository';
import { TransactionRepository } from 'src/transaction/transaction.repository';


@Injectable()
export class AccountService {

  constructor(
    private readonly usersService: UsersService,
    private readonly accountsRepository:AccountRepository,
    @Inject(forwardRef(() => TransactionRepository)) private readonly transactionsRepository:TransactionRepository

  ){}
  create(userId:string,createAccountDto: CreateAccountDto) {
    // let user = this.usersService.findById(userId)

    // if(!user){
    //   return new NotFoundException('User not found');
    // }

    return this.accountsRepository.create({
      userId:userId,
      ...createAccountDto
    })
  }

  async findAccountsSummary(userId:string) {
    
    const totalBalance = await this.accountsRepository.getTotalBalance(userId)
    const totalExpense = await this.transactionsRepository.getTotalExpenses(userId)
    const totalIncome = await this.transactionsRepository.getTotalIncome(userId)
    const lastWeekIncome = await this.transactionsRepository.getLastWeekIncome(userId)

    return {
      totalBalance: totalBalance,
      totalExpense: totalExpense,
      totalIncome: totalIncome,
      lastWeekIncome: lastWeekIncome
    }

  }

  async findAll(userId:string) {
    const accounts = await this.accountsRepository.findAll(userId)

    

    return accounts
  }

  async findOne(userId: string,accountId:string) {
    const account = await this.accountsRepository.findUserAccount(userId,accountId)


    if(!account){
      throw new NotFoundException(`Account with ${accountId} not found for user ${userId}`)
    }

    return account
  }

  async update(userId: string, accountId:string,updateAccountDto: UpdateAccountDto) {
   
    const account = await this.accountsRepository.findUserAccount(userId,accountId)
    
    if(!account){
      return new NotFoundException('Account not found')
    }

    return this.accountsRepository.update(userId,accountId,updateAccountDto)
  }

  async remove(userId: string , accountId:string) {
    const account = await this.accountsRepository.findUserAccount(userId,accountId)
    
    if(!account){
      return new NotFoundException('Account not found')
    }

    return this.accountsRepository.remove(accountId)

  }
}
