import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Authorize } from 'src/Utilities/Guards/authorize.guard';
import { Refresh } from 'src/Utilities/Guards/refresh.guard';

@Module({
    imports: [
        JwtModule.register({
                secret: process.env.JWT_SECRET || 'defaultSecretKey',
                signOptions: {
                  expiresIn: '1m',
                },
              }),
    ],
    providers: [
        Authorize,
        Refresh
    ],
    exports: [
        JwtModule,
        Authorize,
        Refresh,
    ]
})
export class AuthModule {}
