import { InternalServerErrorException } from "@nestjs/common";
import { EntityRepository, Repository } from "typeorm";
import { User } from "./entities/user.entity";


@EntityRepository(User)
export class UserRepository extends Repository<User> {

  // 유저 생성
  async createUser(email: string, password: string): Promise<void> {

    const user = this.create({email:email, password:password});

    console.log("user", user)

    try {
      await this.save(user);
    } catch(err) {

      console.log(err)
      throw new InternalServerErrorException('Internal Server Error is occured. Plz contact administartor.')
    }
  }

  // 모든 유저 가져오기
  async selectAllUsers(): Promise<User[]> {

    const userList = this.find()
    return userList;
  }
}