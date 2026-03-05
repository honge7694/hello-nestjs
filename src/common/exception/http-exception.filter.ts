import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiResponse } from '../interface/api-response.interface';
import { BusinessException } from './business.exception';

interface ErrorResponse {
	errorCode?: string;
	path?: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const status = exception.getStatus();
		const errorResponse = exception.getResponse();
		const errorData: ErrorResponse = {
			errorCode: exception instanceof BusinessException ? exception.errorCode : undefined,
			path: request.url,
		};

		let message: string | string[] | BusinessException;

		if (typeof errorResponse === 'string') {
			// 단순 문자열 예외인 경우
			message = errorResponse;
		} else if (errorResponse instanceof BusinessException) {
			// 커스텀 객체인 경우
			message = errorResponse.message || errorResponse;
		} else {
			// 그 외의 경우
			message = 'Internal Server Error';
		}

		const errorBody: ApiResponse<ErrorResponse> = {
			success: false,
			statusCode: status,
			message: message,
			data: errorData,
			timestamp: new Date().toISOString(),
		};

		response.status(status).json(errorBody);
	}
}
