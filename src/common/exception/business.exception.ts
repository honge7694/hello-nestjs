import { HttpException, HttpStatus } from '@nestjs/common';

export interface ErrorDomain {
	code: string;
	message: string;
	status: HttpStatus;
}

export class BusinessException extends HttpException {
	public readonly errorCode: string;

	constructor(errorDomain: ErrorDomain) {
		super(errorDomain.message, errorDomain.status);
		this.errorCode = errorDomain.code;
	}
}
