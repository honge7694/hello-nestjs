import { HttpStatus } from '@nestjs/common';

export interface ErrorCodeInfo {
	code: string;
	message: string;
	status: HttpStatus;
}
