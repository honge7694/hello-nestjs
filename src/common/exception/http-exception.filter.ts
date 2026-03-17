import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiResponse } from '../interface/api-response.interface';
import { BusinessException } from './business.exception';
import { ClsServiceManager } from 'nestjs-cls';

interface ErrorResponse {
	errorCode?: string;
	path?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(HttpExceptionFilter.name);

	catch(exception: unknown, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
		let message: string | string[];

		const errorData: ErrorResponse = {
			errorCode: exception instanceof BusinessException ? exception.errorCode : undefined,
			path: request.url,
		};

		// CLS에서 현재 요청 UUID 추출
		const cls = ClsServiceManager.getClsService();
		const traceId: string = cls.isActive() ? cls.get('traceId') : 'N/A';

		if (exception instanceof HttpException) {
			const errorResponse = exception.getResponse();
			if (typeof errorResponse === 'string') {
				message = errorResponse;
			} else if (errorResponse instanceof BusinessException) {
				message = errorResponse.message || String(errorResponse);
			} else if (typeof errorResponse === 'object' && errorResponse !== null) {
				const resObj = errorResponse as Record<string, unknown>;
				if (typeof resObj.message === 'string' || Array.isArray(resObj.message)) {
					message = resObj.message as string | string[];
				} else {
					message = 'Internal Server Error';
				}
			} else {
				message = 'Internal Server Error';
			}
		} else if (exception instanceof Error) {
			message = exception.message;
		} else {
			message = 'Internal Server Error';
		}

		const errorBody: ApiResponse<ErrorResponse> = {
			success: false,
			statusCode: status,
			message: message,
			data: errorData,
			timestamp: new Date().toISOString(),
			traceId: traceId,
		};

		// 에러 스택 로깅 추가 (어디서 에러가 났는지 원인 파악용)
		if (exception instanceof Error) {
			this.logger.error(`[${request.method}] ${request.url} - ${exception.message}`, exception.stack);
		} else {
			this.logger.error(`[${request.method}] ${request.url} - Unknown Error`, exception);
		}

		response.status(status).json(errorBody);
	}
}
