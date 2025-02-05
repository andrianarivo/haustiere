import { Role } from '@prisma/client';

export class UserDto {
  id: number;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
} 