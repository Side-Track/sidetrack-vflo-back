import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository
  ) {}

  async signUp(email: string, password: string): Promise<void> {
    return this.userRepository.createUser(email, password);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.selectAllUsers();
  }
}
