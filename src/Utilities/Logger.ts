import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
    console.log('logger 1 called')
    next();
};


export function logger2(req: Request, res: Response, next: NextFunction) {
  console.log('logger 2 called')
  next();
};