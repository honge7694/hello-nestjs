import { HttpStatus } from '@nestjs/common';

export const AuthErrorCode = {
	UNAUTHORIZED: {
		code: 'AUTH_001',
		message: '아이디 또는 비밀번호가 일치하지 않습니다.',
		status: HttpStatus.UNAUTHORIZED,
	},
	INVALID_TOKEN: {
		code: 'AUTH_002',
		message: '유효하지 않은 토큰입니다.',
		status: HttpStatus.UNAUTHORIZED,
	},
	INVALID_REFRESH_TOKEN: {
		code: 'AUTH_003',
		message: '유효하지 않은 토큰입니다.',
		status: HttpStatus.UNAUTHORIZED,
	},
	EXPIRED_TOKEN: {
		code: 'AUTH_004',
		message: '만료된 토큰입니다.',
		status: HttpStatus.UNAUTHORIZED,
	},
	SECURITY_VIOLATION: {
		code: 'AUTH_005',
		message: '비정상적인 접근이 감지되었습니다. 다시 로그인해 주세요',
		status: HttpStatus.UNAUTHORIZED,
	},
};
