import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRepository } from '../../users/repository/user.repository';
import { JwtPayload } from '../interface/jwt-payload.interface';
import { ValidatedUser } from '../interface/validated-user.interface';

/**
 * 사용자가 API 요청하면, JWT 유효성 검사를 진행합니다.
 * 컨트롤러에 도달하기 전에 가로채서 DB 조회 후 검증
 */
@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy, 'access_token') {
	constructor(
		private readonly configService: ConfigService,
		private readonly userRepository: UserRepository,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // JWT를 추출하는 방법을 제공
			ignoreExpiration: false, // JWT 만료 여부를 확인하는 책임을 Passport 모듈에 위임
			secretOrKey: configService.getOrThrow<string>('JWT_SECRET'), // 토큰 서명을 위해 대칭형 비밀 키를 사용
		});
	}

	/**
	 * JWT 검증 성공 시 호출됩니다.
	 * 여기서 반환하는 객체는 request 객체의 user 속성에 저장됩니다 (req.user)
	 * @param payload
	 */
	validate(payload: JwtPayload): ValidatedUser {
		// user 조회 (토큰을 발급받은 유저의 상태가 변경되었을 경우 접근 제어 코드)
		// const user = await this.userRepository.findByUserId(payload.userId);
		// if (!user) {
		// 	throw new BusinessException(AuthErrorCode.UNAUTHORIZED);
		// }

		return {
			code: payload.sub,
			userId: payload.userId,
			role: payload.role,
		};
	}
}
