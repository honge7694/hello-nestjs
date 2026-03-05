import { HttpStatus } from '@nestjs/common';

export const UserErrorCode = {
	USER_NOT_FOUND: {
		code: 'USER_001',
		message: '존재하지 않는 유저입니다.',
		status: HttpStatus.NOT_FOUND,
	},
	USER_ALREADY_EXISTS: {
		code: 'USER_002',
		message: '이미 존재하는 유저입니다.',
		status: HttpStatus.BAD_REQUEST,
	},
	USER_NOT_AUTHORIZED: {
		code: 'USER_003',
		message: '권한이 없습니다.',
		status: HttpStatus.FORBIDDEN,
	},
	USER_NOT_LOGGED_IN: {
		code: 'USER_004',
		message: '로그인 되어 있지 않습니다.',
		status: HttpStatus.UNAUTHORIZED,
	},
};
