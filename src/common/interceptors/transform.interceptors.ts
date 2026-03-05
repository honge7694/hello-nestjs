import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Response as ExpressResponse } from 'express';
import { ApiResponse } from '../interface/api-response.interface';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
	intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
		const httpContext = context.switchToHttp();
		const response = httpContext.getResponse<ExpressResponse>();

		return next.handle().pipe(
			map((data: T) => ({
				success: true,
				statusCode: response.statusCode,
				message: 'success',
				data: data ?? null,
				timestamp: new Date().toISOString(),
			})),
		);
	}
}
