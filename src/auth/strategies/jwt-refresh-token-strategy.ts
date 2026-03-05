import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UserRepository } from '../../users/repository/user.repository';
import { JwtPayload } from '../interface/jwt-payload.interface';
import { ValidatedUser } from '../interface/validated-user.interface';
import { Request } from 'express';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'refresh_token') {
	constructor(
		private readonly configService: ConfigService,
		private readonly userRepository: UserRepository,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(req: Request): string | null => {
					return (req?.cookies?.refreshToken as string) || null;
				},
			]),
			ignoreExpiration: false,
			secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
		});
	}

	/**
	 * JWT 검증 성공 시 호출됩니다.
	 * 여기서 반환하는 객체는 request 객체의 user 속성에 저장됩니다 (req.user)
	 * @param payload
	 */
	validate(payload: JwtPayload): ValidatedUser {
		return {
			code: payload.sub,
			userId: payload.userId,
			role: payload.role,
		};
	}
}
