import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtAccessTokenStrategy } from './strategies/jwt-access-token-strategy';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token-strategy';
import { AuthTokenRepository } from './repository/auth.repository';
import { AuthToken } from './entities/auth-token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [
		JwtModule.registerAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService): JwtModuleOptions => ({
				secret: configService.getOrThrow<string>('JWT_SECRET'),
				signOptions: { expiresIn: configService.getOrThrow<StringValue>('JWT_EXPIRES_IN') },
			}),
		}),
		TypeOrmModule.forFeature([AuthToken]),
		PassportModule,
		UsersModule,
	],
	controllers: [AuthController],
	providers: [AuthService, AuthTokenRepository, LocalStrategy, JwtAccessTokenStrategy, JwtRefreshTokenStrategy],
	exports: [AuthService, AuthTokenRepository],
})
export class AuthModule {}
