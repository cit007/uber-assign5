import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { JwtService } from './jwt.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    // console.log('request:', req.headers);
    if ('x-jwt' in req.headers) {
      const token = req.headers['x-jwt'];
      try {
        console.log('token:', token.toString());
        const decoded = this.jwtService.verify(token.toString());
        if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
          //@BUG THIS IS CALLED EVERY N SEC.
          const user = await this.usersService.findOneUserById(decoded['id']);
          req['user'] = user;
        }
      } catch (e) {}
    }
    next();
  }
}
