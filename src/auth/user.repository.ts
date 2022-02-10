import { ConflictException, InternalServerErrorException } from "@nestjs/common";
import { ResponseDto } from "src/dto/response.dto";
import { EntityRepository, Repository } from "typeorm";
import { UserCredentialDto } from "./dto/user-credential.dto";
import { User } from "./entities/user.entity";
import * as bcrypt from 'bcryptjs'


@EntityRepository(User)
export class UserRepository extends Repository<User> {

  // 유저 생성
  async createUser(userCredentialDto: UserCredentialDto): Promise<void> {

    const {email, password} = userCredentialDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = this.create({email:email, password:hashedPassword});

    try {
      await this.save(user);
    } catch(err) {

      if(err.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Already existing user name');
      }

      throw new InternalServerErrorException('Internal Server Error is occured. Plz contact administartor.')
    }
  }

  // 모든 유저 가져오기
  async selectAllUsers(): Promise<User[]> {

    const userList = this.find()
    return userList;
  }
}