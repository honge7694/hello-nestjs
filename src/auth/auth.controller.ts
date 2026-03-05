import { Body, Controller, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import express from 'express';
import { Public } from 'src/auth/decorators/public.decorator';
import { UserLoginDto } from '../users/dto/login-user.dto';
import { AuthService } from './auth.service';
import { JwtRefreshTokenGuard } from './guard/jwt-refresh-token.guard';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { ConfigService } from '@nestjs/config';
import { LoginMetadata } from './interface/login-metadata.interface';
import { ValidatedUser } from './interface/validated-user.interface';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly configService: ConfigService,
	) {}

	@Public()
	@HttpCode(200)
	@UseGuards(LocalAuthGuard)
	@Post('login')
	async login(@Body() loginDto: UserLoginDto, @Req() req: express.Request, @Res({ passthrough: true }) res: express.Response): Promise<{ accessToken: string }> {
		const metadata: LoginMetadata = {
			ip: req.ip || req.get('x-forwarded-for') || req.socket.remoteAddress || '',
			userAgent: req.get('user-agent') || '',
		};

		// Passport에 의해 주입된 유저 정보 타입 지정
		const user = req.user as ValidatedUser;
		const tokenData = await this.authService.login(user, metadata);
		const maxAge = Number.parseInt(this.configService.getOrThrow<string>('JWT_REFRESH_COOKIE_MAX_AGE'), 10);

		// 쿠키에 토큰 저장
		res.cookie('refreshToken', tokenData.refreshToken, {
			httpOnly: true, // 자바스크립트로 접근 불가 (XSS 방어)
			secure: process.env.NODE_ENV === 'production', // HTTPS 환경에서만 전송 (운영 환경 필수)
			sameSite: 'none', // CSRF 공격 방어 (같은 도메인 strict ELSE none)
			path: '/', // 모든 경로에서 쿠키 유효
			maxAge: maxAge,
		});

		return { accessToken: tokenData.accessToken };
	}

	@Public()
	@UseGuards(JwtRefreshTokenGuard)
	@Post('refresh')
	async refresh(@Req() req: express.Request, @Res({ passthrough: true }) res: express.Response): Promise<{ accessToken: string }> {
		const metadata: LoginMetadata = {
			ip: req.ip || req.get('x-forwarded-for') || req.socket.remoteAddress || '',
			userAgent: req.get('user-agent') || '',
		};

		// Passport에 의해 주입된 유저 정보 타입 지정
		const user = req.user as ValidatedUser;
		const tokenData = await this.authService.refreshTokens(user, metadata, req);
		const maxAge = Number.parseInt(this.configService.getOrThrow<string>('JWT_REFRESH_COOKIE_MAX_AGE'), 10);

		if (tokenData.refreshToken) {
			// 쿠키에 토큰 저장
			res.cookie('refreshToken', tokenData.refreshToken, {
				httpOnly: true, // 자바스크립트로 접근 불가 (XSS 방어)
				secure: process.env.NODE_ENV === 'production', // HTTPS 환경에서만 전송 (운영 환경 필수)
				sameSite: 'none', // CSRF 공격 방어 (같은 도메인 strict ELSE none)
				path: '/', // 모든 경로에서 쿠키 유효
				maxAge: maxAge,
			});
		}

		return { accessToken: tokenData.accessToken };
	}
}
