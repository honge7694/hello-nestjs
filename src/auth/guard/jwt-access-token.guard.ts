import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { BusinessException } from 'src/common/exception/business.exception';
import { AuthErrorCode } from '../exception/AuthErrorCode';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/auth/decorators/public.decorator';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAccessAuthGuard extends AuthGuard('access_token') {
	constructor(private readonly reflector: Reflector) {
		super();
	}

	// 요청이 들어올 때마다 가장 먼저 실행되는 메서드
	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(), // 메서드 레벨 확인 (@Get, @Post 등에 붙었는지)
			context.getClass(), // 클래스 레벨 확인 (@Controller에 붙었는지)
		]);

		if (isPublic) {
			return true;
		}

		return super.canActivate(context);
	}

	// Invalid Token 커스텀 에러
	handleRequest(err: any, user: any, info: any): any {
		if (err || !user) {
			throw new BusinessException(AuthErrorCode.INVALID_TOKEN);
		}

		return user;
	}
}
