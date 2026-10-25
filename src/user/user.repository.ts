import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({
      where: { id },

    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email },
      relations: {
        accounts: true,
      },
    });
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.repository.create(user);

    return this.repository.save(newUser);
  }

  async update(
  id: string,
  data: Partial<User>,
): Promise<User | null> {
  const user = await this.repository.preload({
    id,
    ...data,
  });

  if (!user) {
    return null;
  }

  return this.repository.save(user);
}
}