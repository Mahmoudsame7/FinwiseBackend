import { Injectable } from '@nestjs/common';
import { CreateRefreshTokenDto, UpdateRefreshTokenDto } from './dto/create-refresh-token.dto';
import { RefreshTokenRepository } from './refresh-token.repository';
import { RefreshRefreshTokenDto } from './dto/refresh-refresh-token.dto';
import { RefreshToken } from './entities/refresh-token.entity';


@Injectable()
export class RefreshTokenService {

  constructor(private readonly refreshTokenRepository: RefreshTokenRepository) {}

  create(createRefreshTokenDto: CreateRefreshTokenDto) {
    this.refreshTokenRepository.create(createRefreshTokenDto);
  }


  findOne(refreshToken: string) {
    return this.refreshTokenRepository.findByToken(refreshToken);
  }

  remove(token: RefreshToken) {
    this.refreshTokenRepository.remove(token);
  }
  

  findAll() {
    return `This action returns all refreshToken`;
  }

  

  update(id: number, updateRefreshTokenDto: UpdateRefreshTokenDto) {
    return `This action updates a #${id} refreshToken`;
  }

  
}
