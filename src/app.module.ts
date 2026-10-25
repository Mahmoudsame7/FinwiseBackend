import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/product.module';
import { ConfigModule } from '@nestjs/config';


import Configuration from './Utilities/Configuration';
import DatabaseConfig from './Utilities/DatabaseConfig';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './user/user.module';
import { LoginModule } from './login/login.module';
import { AccountModule } from './account/account.module';
import { RefreshTokenModule } from './refresh-token/refresh-token.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { TransactionModule } from './transaction/transaction.module';
import { CategoryModule } from './category/category.module';

@Module({
  // imports: [ProductModule,ConfigModule.forRoot({
  //   isGlobal: true,
  //   load: [Configuration,DatabaseConfig],
  //   // load: [DatabaseConfig],
  //   envFilePath: 'development.env',
    
  // })],
  
  controllers: [AppController],
  providers: [AppService],
  imports: [  

  ConfigModule.forRoot(),
  TypeOrmModule.forRoot({
      type: 'postgres',
      // host: 'localhost',
      // port: 5432,
      // username: 'postgres',
      // password: 'M@7moud2025',
      // database: 'FinwiseBackend',
      // autoLoadEntities: true,
      // synchronize: true,

      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: false,
      ssl: { rejectUnauthorized: false },
  
     
    }),
  
   UsersModule,
   LoginModule,
   AccountModule,
   RefreshTokenModule,
   TransactionModule,
   CategoryModule,
  //  AuthModule,
  ],
})
export class AppModule {}
