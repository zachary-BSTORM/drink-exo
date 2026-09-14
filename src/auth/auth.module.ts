import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { UserModule } from '../user/user.module.js';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports : [UserModule,
    JwtModule.register({
      secret : '7DS809QS7F9QDSF7QSDF7QSD89F7QSD0F7',
      signOptions : {
        expiresIn : '1h'
      }
    })

  ],
  controllers : [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
