import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Response as ExpressResponse } from 'express';
import { ApiResponse } from '../interface/api-response.interface';
import { ClsServiceManager } from 'nestjs-cls';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
	intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
		const httpContext = context.switchToHttp();
		const response = httpContext.getResponse<ExpressResponse>();

		// CLS에서 현재 요청 UUID 추출
		const cls = ClsServiceManager.getClsService();
		const traceId: string = cls.isActive() ? cls.get('traceId') : 'N/A';

		return next.handle().pipe(
			map((data: T) => ({
				success: true,
				statusCode: response.statusCode,
				message: 'success',
				data: data ?? null,
				timestamp: new Date().toISOString(),
				traceId: traceId,
			})),
		);
	}
}
