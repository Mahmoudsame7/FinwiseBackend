import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './user.repository';
import { UpdateUserDto,CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenService } from 'src/refresh-token/refresh-token.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService

  ) {}

  async findById(id: string) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.usersRepository.findByEmail(email.toLowerCase());
  }

  async createUser(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findByEmail(createUserDto.email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }


     const passwordHash = await bcrypt.hash(
      createUserDto.password,
      12,
    );

    let createdUser = await this.usersRepository.create({
      email: createUserDto.email.toLowerCase(),
      password: passwordHash,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      mobileNumber: createUserDto.mobileNumber,
      dateOfBirth: createUserDto.dateOfBirth,
    });

     const accessToken = this.jwtService.sign({ userId: createdUser.id,email: createdUser.email });
     const refreshToken = this.jwtService.sign({ userId: createdUser.id,email: createdUser.email }, { expiresIn: '5m',secret: process.env.JWT_REFRESH_SECRET || 'defaultRefreshSecretKey' });

    this.refreshTokenService.create({ userId: createdUser.id, refreshToken: refreshToken, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });

    return  { user: createdUser, accessToken: accessToken, refreshToken: refreshToken };
  }



async updateUser(
  id: string,
  data: UpdateUserDto,
){
  const existingUser = await this.usersRepository.findById(id);

  if (!existingUser) {
    throw new NotFoundException('User not found');
  }

  if (
    data.email &&
    data.email !== existingUser.email
  ) {
    const userWithEmail =
      await this.usersRepository.findByEmail(data.email);

    if (userWithEmail) {
      throw new ConflictException('Email already exists');
    }
  }

  if (data.password) {
    const passwordHash = await bcrypt.hash(
      data.password,
      12,
    );
    data.password = passwordHash;
  }

  const updatedUser = await this.usersRepository.update(
    id,
    data,
  );

  if (!updatedUser) {
    throw new NotFoundException('User not found');
  }

  return updatedUser;
}

  
}