import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "./entities/user.entity";
import { UserRepository } from "./user.repository";

@Injectable()

export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor(@InjectRepository(UserRepository) private userRepository: UserRepository) {

    super({
      secretOrKey : process.env.JWT_SECRET,
      jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload) {

    const {idx} = payload;
    const user: User = await this.userRepository.findOne({idx:idx});

    if(!user) {
      throw new UnauthorizedException();
    }

    // requset 에 user객체 넣을 때 비밀번호는 빼고 넣음
    delete user.password

    return user;
  }
}

