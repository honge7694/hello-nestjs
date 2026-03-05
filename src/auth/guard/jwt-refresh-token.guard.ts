import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BusinessException } from 'src/common/exception/business.exception';
import { AuthErrorCode } from '../exception/AuthErrorCode';

@Injectable()
export class JwtRefreshTokenGuard extends AuthGuard('refresh_token') {
	constructor() {
		super();
	}

	// Invalid Token 커스텀 에러
	handleRequest(err: any, user: any, info: any): any {
		if (err || !user) {
			throw new BusinessException(AuthErrorCode.INVALID_REFRESH_TOKEN);
		}

		return user;
	}
}
