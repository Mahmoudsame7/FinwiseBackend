import { Injectable } from "@nestjs/common";
import { RefreshToken } from "./entities/refresh-token.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { RefreshRefreshTokenDto } from "./dto/refresh-refresh-token.dto";

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repository: Repository<RefreshToken>,
  ) {}

  


  async create(refreshToken: Partial<RefreshToken>): Promise<RefreshToken> {
    const newRefreshToken = this.repository.create(refreshToken);
    return this.repository.save(newRefreshToken);
  }

  async findByToken(refreshToken: string): Promise<RefreshToken | null> {
    return this.repository.findOne({ where: { refreshToken } });
  }

  async remove(refreshToken: RefreshToken): Promise<void> {
    await this.repository.remove(refreshToken);
  }

 
}