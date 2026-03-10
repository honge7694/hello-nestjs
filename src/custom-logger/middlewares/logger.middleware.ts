import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

/**
 * HTTP 요청/응답 자동 로깅
 * 클라이언트가 호출한 API의 경로, 상태 코드, 소요 시간, IP를 기록
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
	private logger = new Logger('HTTP');

	use(request: Request, response: Response, next: NextFunction): void {
		const { ip, method, originalUrl } = request;
		const userAgent = request.get('user-agent') || '';
		const startTime = Date.now();

		// 응답이 완료되었을 때 이벤트 발생
		response.on('finish', () => {
			const { statusCode } = response;
			const delay = Date.now() - startTime;

			this.logger.log(`${method} ${originalUrl} ${statusCode} - ${userAgent} [${delay}ms]`);
		});

		next();
	}
}
