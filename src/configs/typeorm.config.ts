import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as config from 'config'

const dbConfigs = config.get('db')
export const typeORMConfig : TypeOrmModuleOptions = {

  // DB settings
  type : "mariadb",
  host: 'sidetrack.cp5i1btohurv.us-east-1.rds.amazonaws.com',
  port : 3306,
  username: process.env.RDS_USERNAME || dbConfigs.username,
  password: process.env.RDS_USERNAME || dbConfigs.password,
  database : 'vflo',


  // Entities to be loaded for connection
  entities : [__dirname + '/../**/*.entity.{js,ts}'],

  synchronize: true
}