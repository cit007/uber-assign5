import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async findOneUserById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOne({ id });
      if (user) {
        return {
          ok: true,
          user: user,
        };
      }
    } catch (error) {
      return { ok: false, error: 'user not Found' };
    }
  }

  async createAccount(
    createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    const { email, password, role } = createAccountInput;
    try {
      const isMail = await this.users.findOne({ email });
      console.log('login', isMail);
      if (isMail) {
        return { ok: false, error: 'user exists already' };
      }
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      return { ok: true };
    } catch (e) {
      return { ok: false, error: 'could not create account' };
    }
  }
}
