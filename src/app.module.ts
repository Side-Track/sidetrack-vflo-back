import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "mariadb",
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities : [__dirname + '/**/*.entity.{js,ts}'],
      synchronize: process.env.DB_SYNC === 'true'
    }),
    MailerModule.forRoot({
      transport: 'smtp://' + process.env.EMAIL_HOST + ':' + process.env.EMAIL_HOST_PASSWORD +'@smtp.gmail.com',
      defaults: {
        from: '"no-reply" <' + process.env.EMAIL_HOST +'>',
      }
    }),
    AuthModule,
    ConfigurationModule,
    ProfileModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
