import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import ms, { StringValue } from 'ms';
import { BusinessException } from 'src/common/exception/business.exception';
import { UserRepository } from '../users/repository/user.repository';
import { AuthErrorCode } from './exception/AuthErrorCode';
import { JwtPayload } from './interface/jwt-payload.interface';
import { ValidatedUser } from './interface/validated-user.interface';
import { AuthTokenRepository } from './repository/auth.repository';
import { UAParser } from 'ua-parser-js';
import { LoginMetadata } from './interface/login-metadata.interface';
import { AuthToken } from './entities/auth-token.entity';
import express from 'express';

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);

	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly userRepository: UserRepository,
		private readonly authTokenRepository: AuthTokenRepository,
	) {}

	/**
	 * @UseGuards(AuthGuard('local'))에 의해 실행되는 유저 검증 메서드입니다.
	 * @param userId
	 * @param password
	 */
	async validateUser(userId: string, password: string): Promise<any> {
		const user = await this.userRepository.findByUserId(userId);

		if (user && (await bcrypt.compare(password, user.password))) {
			const { password, ...result } = user; // 비밀번호 제외 후 user만 추출
			this.logger.log(`[LOGIN] user: ${JSON.stringify(result)}`);

			return result;
		} else {
			throw new BusinessException(AuthErrorCode.UNAUTHORIZED);
		}
	}

	/**
	 * AccessToken과 RefreshToken을 발급합니다.
	 * @param user
	 * @param metadata
	 */
	async login(user: ValidatedUser, metadata: LoginMetadata): Promise<{ accessToken: string; refreshToken: string }> {
		const { accessToken, refreshToken } = await this.getTokens(user.code, user.userId, user.role);
		// refreshToken DB 저장
		await this.setRefreshToken(user, metadata, refreshToken);

		return {
			accessToken,
			refreshToken,
		};
	}

	// accessToken과 refreshToken 생성
	async getTokens(userCode: string, loginId: string, role: string): Promise<{ accessToken: string; refreshToken: string }> {
		const payload: JwtPayload = {
			sub: userCode,
			userId: loginId,
			role,
		};
		const [accessToken, refreshToken] = await Promise.all([
			// accessToken
			this.jwtService.signAsync(payload),
			// refreshToken
			this.jwtService.signAsync(payload, {
				secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
				expiresIn: this.configService.getOrThrow<StringValue>('JWT_REFRESH_EXPIRES_IN'),
			}),
		]);

		return {
			accessToken,
			refreshToken,
		};
	}

	// refreshToken 저장
	async setRefreshToken(user: ValidatedUser, metadata: LoginMetadata, refreshToken: string): Promise<void> {
		const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

		// User-Agent 파싱
		const parser = new UAParser(metadata.userAgent);
		const browser = parser.getBrowser();
		const os = parser.getOS();
		const device = parser.getDevice();

		// 만료 시간 계산
		const refreshTokenExpiresIn = this.configService.getOrThrow<StringValue>('JWT_REFRESH_EXPIRES_IN');
		const expireMs = ms(refreshTokenExpiresIn);
		const expireSeconds = Math.floor(expireMs / 1000);
		const expireDate = new Date(Date.now() + expireMs);

		// 기존에 있는 Refresh Token 상태 비활성화
		await this.authTokenRepository.update(
			{
				userCode: user.code,
				userId: user.userId,
				status: 'ACT',
			},
			{
				status: 'END',
				updateUserId: user.userId,
				updateUserCode: user.code,
			},
		);

		// DB 저장 데이터 타입 정의
		const authTokenData: Partial<AuthToken> = {
			userCode: user.code,
			userId: user.userId,
			role: user.role,
			refreshToken: hashedRefreshToken, // 해싱된 토큰 저장
			refreshTokenCreateDate: new Date(),
			refreshTokenExpireSeconds: expireSeconds,
			refreshTokenExpireDate: expireDate,
			tokenIssuedIpAddress: metadata.ip,
			tokenIssuedBrowser: browser.name ?? 'Unknown',
			tokenIssuedOsName: os.name ?? 'Unknown',
			tokenIssuedDevice: device.type ?? 'Desktop',
			createUserId: user.userId,
			createUserCode: user.code,
			updateUserId: user.userId,
			updateUserCode: user.code,
		};

		await this.authTokenRepository.save(authTokenData);
	}

	/**
	 * Refresh Token을 사용하여 AccessToken을 재발급합니다.<br/>
	 * 만료 1시간 이내 재요청 시 RefreshToken도 재발급합니다.
	 * @param user 사용자 정보
	 * @param metadata 로그인 메타데이터
	 * @param req HTTP 요청
	 * @returns
	 */
	async refreshTokens(user: ValidatedUser, metadata: LoginMetadata, req: express.Request): Promise<{ accessToken: string; refreshToken: string }> {
		const userTokens = await this.authTokenRepository.findOne({
			where: {
				userCode: user.code,
				status: 'ACT',
			},
		});
		if (!userTokens) {
			throw new BusinessException(AuthErrorCode.UNAUTHORIZED);
		}

		const refreshToken = (req.cookies as Record<string, string>)?.refreshToken || '';
		const isMatch = await bcrypt.compare(refreshToken, userTokens.refreshToken);

		// 토큰 유효하지 않음
		if (!isMatch) {
			throw new BusinessException(AuthErrorCode.UNAUTHORIZED);
		}

		// 이미 사용된 토큰으로 요청 (탈취)
		if (userTokens.status === 'END') {
			throw new BusinessException(AuthErrorCode.SECURITY_VIOLATION);
		}

		// 보유 Refresh Token 만료 1시간 이내 재발급
		const now = new Date();
		const timeUntilExpiry = userTokens.refreshTokenExpireDate.getTime() - now.getTime();
		const ONE_HOUR_MS = 60 * 60 * 1000;

		if (timeUntilExpiry < ONE_HOUR_MS) {
			const { accessToken, refreshToken } = await this.getTokens(user.code, user.userId, user.role);
			// refreshToken DB 저장
			await this.setRefreshToken(user, metadata, refreshToken);

			return {
				accessToken,
				refreshToken,
			};
		}

		// Refresh Token 만료 1시간 이상 AccessToken 발급
		const accessToken = await Promise.resolve(
			this.jwtService.signAsync({
				sub: user.code,
				userId: user.userId,
				role: user.role,
			}),
		);

		return {
			accessToken: accessToken,
			refreshToken: '',
		};
	}
}
