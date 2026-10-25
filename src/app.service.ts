import { HttpCode, Injectable,Res } from '@nestjs/common';
import { Request,Response } from 'express';

@Injectable()
export class AppService {
  getHello(request:Request): object {
    return {
      "msg": 'Hello World!',
      "body": request.body,
      "params": request.params,
      "queryParams":request.query,
      "headers":request.headers,
      "ip":request.ip,
      "host":request.host

    };
  }


  getHelloById(id:number,@Res() response:Response) {

    console.log(typeof id)
    if(id<0){
      response.status(400).json({
        "validation error": "number smaller than zero"
      })
    }
    else{
      response.status(200).json({
        "msg": id
      })
    }
    
    
  }
}
