import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from './user/user.module';
import { User } from "./user/entities/user.entity";
import { Permission } from "./user/entities/permission.entity";
import { Role } from "./user/entities/role.entity";
import { JwtModule } from "@nestjs/jwt";
import { AaaModule } from './aaa/aaa.module';
import { BbbModule } from './bbb/bbb.module';
import { APP_GUARD } from "@nestjs/core";
import { LoginGuard } from "./login.guard";
import { PermissionGuard } from "./permission.guard";

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: 'wu',
      signOptions: {
        expiresIn: '7d'
      }
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'wu',
      database: 'rbac_test',
      synchronize: true,
      logging: true,
      entities: [User, Role, Permission],
      poolSize: 10,
      connectorPackage: 'mysql2',
      extra: {
        authPlugin: 'sha256_password'
      }
    }),
    UserModule,
    AaaModule,
    BbbModule
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: LoginGuard
    },{
    provide: APP_GUARD,
      useClass: PermissionGuard
    }],
})
export class AppModule {}
