import { HttpException } from '@nestjs/common';
import { ErrorCodeInfo } from 'src/common/interface/error-code.interface';

export class BusinessException extends HttpException {
	public readonly errorCode: string;

	constructor(errorDomain: ErrorCodeInfo) {
		super(errorDomain.message, errorDomain.status);
		this.errorCode = errorDomain.code;
	}
}
