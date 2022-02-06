import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseDto } from 'src/dto/response.dto';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository
  ) {}

  async signUp(email: string, password: string): Promise<ResponseDto> {
    this.userRepository.createUser(email, password);

    let response = new ResponseDto(200, undefined, undefined) 
    return response;
  }

  async getAllUsers(): Promise<ResponseDto> {
    let userList:User[] = await this.userRepository.selectAllUsers();
    let response = new ResponseDto(200, undefined, { list:userList }) 
    return response;
  }
}
