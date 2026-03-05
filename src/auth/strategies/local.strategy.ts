import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

/**
 * 사용자가 로그인 API로 ID와 PW를 전송하면,
 * 컨트롤러에 도달하기 전에 가로채서 DB조회를 수행
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly authService: AuthService) {
		super({
			usernameField: 'userId',
			passwordField: 'password',
		});
	}

	/**
	 * Guard가 요청을 가로채어 자동으로 validate 메서드를 실행합니다.
	 * @param userId
	 * @param password
	 */
	async validate(userId: string, password: string): Promise<any> {
		return await this.authService.validateUser(userId, password);
	}
}
