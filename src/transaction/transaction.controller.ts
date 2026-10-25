import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode, UseGuards, Query, ParseUUIDPipe } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto, CreateTransactionSchema, GetTransactionDto, GetTransactionsSchema, GetTransactionsSummarySchema, GetTransactionSummaryDto, SearchTransactionsDto, SearchTransactionsSchema, UpdateTransactionDto, UpdateTransactionSchema } from './dto/create-transaction.dto';
import { Authorize } from 'src/Utilities/Guards/authorize.guard';
import { User } from 'src/Utilities/user.decorator';
import { ValidationPipe } from 'src/Utilities/validation.pipe';
import { TransactionType } from './entities/transaction.entity';


@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) { }

  @HttpCode(200)
  @Post()
  @UseGuards(Authorize)
  create(@User("userId") userId: string, @Body(new ValidationPipe(CreateTransactionSchema)) createTransactionDto: CreateTransactionDto) {
    return this.transactionService.create(userId, createTransactionDto);
  }

  // @HttpCode(200)
  // @Post('sms')
  // @UseGuards(Authorize)
  // createTransactionFromSms(@User("userId") userId: string, @Body() smsDto: {message:string}) {
  //   return this.transactionService.createTransactionFromSms(userId, smsDto);
  // }

  @HttpCode(200)
  @Get()
  @UseGuards(Authorize)
  find(
    @User('userId') userId: string,
    @Query('accountId') accountId?: string,

  ) {
    if (accountId) {
      return this.transactionService.findByAccount(
        userId,
        accountId,
      );
    }

    return this.transactionService.findAll(userId);
  }

  @Get('all-summary')
  @UseGuards(Authorize)
  getAllSummary(
    @User('userId') userId: string,
    // @Query(new ValidationPipe(GetTransactionsSummarySchema))
    // query: GetTransactionSummaryDto,
  ) {
    return this.transactionService.findAllSummary(
      userId
    );
  }

  @Get('year-summary')
  @UseGuards(Authorize)
  getYearSummary(
    @User('userId') userId: string,
    // @Query(new ValidationPipe(GetTransactionsSummarySchema))
    // query: GetTransactionSummaryDto,
  ) {
    return this.transactionService.findYearSummary(
      userId
    );
  }

  @Get('month-summary')
  @UseGuards(Authorize)
  getMonthSummary(
    @User('userId') userId: string,
    // @Query(new ValidationPipe(GetTransactionsSummarySchema))
    // query: GetTransactionSummaryDto,
  ) {
    return this.transactionService.findMonthSummary(
      userId
    );
  }

  @Get('week-summary')
  @UseGuards(Authorize)
  getPeriodSummary(
    @User('userId') userId: string,
    // @Query(new ValidationPipe(GetTransactionsSummarySchema))
    // query: GetTransactionSummaryDto,
  ) {
    return this.transactionService.findWeekSummary(
      userId
    );
  }

  @Get('period')
  @UseGuards(Authorize)
  getByPeriod(
    @User('userId') userId: string,
    @Query(new ValidationPipe(GetTransactionsSchema))
    query: GetTransactionDto,
  ) {
    return this.transactionService.findByPeriod(
      userId,
      query,
    );
  }


  @Post('search')
  @UseGuards(Authorize)
  searchTransactions(
    @User('userId') userId: string,
    @Body(new ValidationPipe(SearchTransactionsSchema))
    body: SearchTransactionsDto,
  ) {
    return this.transactionService.searchTransactions(
      userId,
      body,
    );
  }


  @HttpCode(200)
  @Get(':id')
  @UseGuards(Authorize)
  findOne(@User("userId") userId: string, @Param('id') transactionId: string) {
    return this.transactionService.findOne(userId, transactionId);
  }



  @HttpCode(200)
  @Patch(':id')
  @UseGuards(Authorize)
  update(@User("userId") userId: string, @Param('id') transactionId: string, @Body(new ValidationPipe(UpdateTransactionSchema)) updateTransactionDto: UpdateTransactionDto) {
    return this.transactionService.update(userId, transactionId, updateTransactionDto);
  }

  @HttpCode(200)
  @Delete(':id')
  @UseGuards(Authorize)
  remove(@User("userId") userId: string, @Param('id') id: string) {
    return this.transactionService.remove(userId, id);
  }
}
