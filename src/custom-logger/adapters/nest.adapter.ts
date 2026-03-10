import { LoggerService } from '@nestjs/common';
import { coreLogger } from '../core/winston.config';

export class CustomNestLogger implements LoggerService {
	log(message: any, ...optionalParams: any[]): void {
		this.callWinston('info', message, ...optionalParams);
	}
	error(message: any, ...optionalParams: any[]): void {
		this.callWinston('error', message, ...optionalParams);
	}
	warn(message: any, ...optionalParams: any[]): void {
		this.callWinston('warn', message, ...optionalParams);
	}
	debug(message: any, ...optionalParams: any[]): void {
		this.callWinston('debug', message, ...optionalParams);
	}
	verbose(message: any, ...optionalParams: any[]): void {
		this.callWinston('verbose', message, ...optionalParams);
	}

	private callWinston(level: string, message: any, ...optionalParams: any[]): void {
		let context = 'App';
		let meta = {};

		if (optionalParams.length > 0) {
			// 마지막 인자가 문자열(String)인 경우에만 Context로 판단
			const lastParam = optionalParams[optionalParams.length - 1];
			if (typeof lastParam === 'string') {
				context = optionalParams.pop();
			}

			// Context 추출 후 남은 데이터 객체(메타데이터)로 취급
			if (optionalParams.length > 0) {
				meta = optionalParams[0];
			}
		}

		// Winston으로 데이터 전송
		if (typeof message === 'object') {
			coreLogger.log(level, 'Object Logged', {
				context,
				data: message,
				...meta,
			});
		} else {
			coreLogger.log(level, message, {
				context,
				...(typeof meta === 'object' ? meta : { meta }),
			});
		}
	}
}
