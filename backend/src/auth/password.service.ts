import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordService {
  // This number determines how secure the hash will be
  private readonly saltRounds = 10;

  // This function takes a plain password and makes it secure
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  // This function checks if a password matches its secure version
  async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
} 