import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, UseGuards, UsePipes } from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto, CreateAccountSchema, UpdateAccountDto, UpdateAccountSchema } from './dto/create-account.dto';
import { Authorize } from 'src/Utilities/Guards/authorize.guard';
import { User } from 'src/Utilities/user.decorator';
import { ValidationPipe } from 'src/Utilities/validation.pipe';


@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @HttpCode(200)
  @Post()
  @UseGuards(Authorize)
  create(@User('userId') userId:string , @Body(new ValidationPipe(CreateAccountSchema)) createAccountDto: CreateAccountDto) {
    return this.accountService.create(userId,createAccountDto);
  }

  @Get('summary')
  @UseGuards(Authorize)
  findAccountsSummary(@User('userId')userId:string) {
    return this.accountService.findAccountsSummary(userId);
  }

  @Get()
  @UseGuards(Authorize)
  findAll(@User('userId')userId:string) {
    return this.accountService.findAll(userId);
  }

  @Get(':id')
  @UseGuards(Authorize)
  findOne(@User('userId') userId:string, @Param('id') accountId: string) {

    console.log(userId)
    return this.accountService.findOne(userId,accountId);
  }

 
  @HttpCode(200)
  @Patch(':id')
  @UseGuards(Authorize)
  update(@User('userId') userId: string,@Param('id') accountId: string, @Body(new ValidationPipe(UpdateAccountSchema)) updateAccountDto: UpdateAccountDto) {
    return this.accountService.update(userId, accountId,updateAccountDto);
  }

  @HttpCode(200)
  @Delete(':id')
  @UseGuards(Authorize)
  remove(@User('userId') userId: string,@Param('id') accountId: string) {
    return this.accountService.remove(userId,accountId);
  }
}
