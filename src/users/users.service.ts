import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { User } from './entities/user.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly jwtService: JwtService,
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

  async login(loginInput: LoginInput): Promise<LoginOutput> {
    const { email, password } = loginInput;
    console.log('login :', email, password);
    try {
      const user = await this.users.findOne({ email });
      if (!user) {
        return { ok: false, error: 'user not found' };
      }

      const isPwdOk = await user.checkPassword(password);
      if (!isPwdOk) {
        return { ok: false, error: 'wrong password' };
      }

      const token = this.jwtService.sign(user.id);
      return { ok: true, token };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async editProfile(
    userId: number,
    editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    console.log('userId:', userId);
    try {
      const { email, password } = editProfileInput;
      const user = await this.users.findOne(userId);

      email ? (user.email = email) : user.email;
      password ? (user.password = password) : user.password;

      await this.users.save(user);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Could not update profile.' };
    }
  }
}
