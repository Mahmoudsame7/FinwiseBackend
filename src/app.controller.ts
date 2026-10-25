import { Controller, Get, Param, ParseIntPipe, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { Request,Response } from 'express';
import { ConfigService } from '@nestjs/config';


@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    // private readonly configService: ConfigService
  ) {}

  @Get()
  getHello(@Req() request:Request): object {

    // console.log("saved configs", this.configService.get('database2'));
    return this.appService.getHello(request);
  }

 

}
