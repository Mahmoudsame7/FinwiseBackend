import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  UsePipes
} from '@nestjs/common';

import { UsersService } from './user.service';
import { CreateUserDto, createUserSchema, UpdateUserDto } from './dto/create-user.dto';
import { ValidationPipe } from 'src/Utilities/validation.pipe';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe(createUserSchema))
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get(':id')
  findById(
    @Param('id') id: string,
  ) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    // Implement the update logic here
    return this.usersService.updateUser(id, updateUserDto);
  }

}