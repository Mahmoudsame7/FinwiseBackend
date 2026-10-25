import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginRequestDto } from './dto/loginRequest.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/user/user.service';
import { RefreshTokenService } from 'src/refresh-token/refresh-token.service';
import { JwtService } from '@nestjs/jwt';
import { RefreshRefreshTokenDto } from 'src/refresh-token/dto/refresh-refresh-token.dto';


@Injectable()
export class LoginService {

  constructor(private readonly usersService: UsersService,private readonly jwtService: JwtService,private readonly refreshTokenService: RefreshTokenService) {}
  
  async login(loginDto: LoginRequestDto) {
     console.log(loginDto)
     const user = await this.usersService.findByEmail(loginDto.email);

      if (!user) {
      throw new NotFoundException('Invalid credentials');
    }
     const passwordMatch = await bcrypt.compare(loginDto.password, user.password);

     if (!passwordMatch) {
      throw new NotFoundException('Invalid credentials');
    }
   

    const accessToken = this.jwtService.sign({ userId: user.id,email: user.email });
    const refreshToken = this.jwtService.sign({ userId: user.id,email: user.email }, { expiresIn: '5m',secret: process.env.JWT_REFRESH_SECRET || 'defaultRefreshSecretKey' });

    this.refreshTokenService.create({ userId: user.id, refreshToken: refreshToken, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });

    return  { user: user, accessToken: accessToken, refreshToken: refreshToken };
  }

  async refreshToken(userId: string, refreshToken: string) {

    console.log('Received Refresh Token:', refreshToken);
    console.log('User ID:', userId);

    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    const storedRefreshToken = await this.refreshTokenService.findOne(refreshToken);

    console.log(storedRefreshToken.expiresAt)
    console.log(new Date())
    
    if (!storedRefreshToken || storedRefreshToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // console.log('Stored Refresh Token:', storedRefreshToken);
    // this.refreshTokenService.remove(storedRefreshToken);

    const accessToken = this.jwtService.sign({ userId: user.id,email: user.email });
    const newRefreshToken = this.jwtService.sign({ userId: user.id,email: user.email }, { expiresIn: '5m',secret: process.env.JWT_REFRESH_SECRET || 'defaultRefreshSecretKey' });

    console.log('New Refresh Token:', newRefreshToken);
    this.refreshTokenService.create({ userId: user.id, refreshToken: newRefreshToken, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });


    return  {  accessToken: accessToken, refreshToken: newRefreshToken };
  }
  
}
