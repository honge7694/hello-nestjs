import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import * as crypto from 'crypto';
import { inspect } from 'util';
import { ClsServiceManager } from 'nestjs-cls';
import { getTodayString } from 'src/common/utils/date.util';

// 개발/운영 환경 로그 레벨 분기
const isLocal = process.env.NODE_ENV === 'local' || !process.env.NODE_ENV;
const level = isLocal ? 'debug' : 'info';

const emojiMap: Record<string, string> = {
	error: '🚨',
	warn: '⚠️',
	info: '🍀',
	verbose: '📢',
	debug: '🐛',
};

// 터미널 색상 적용을 위한 ANSI 헬퍼 함수
const colors = {
	gray: (text: string): string => `\x1b[90m${text}\x1b[0m`, // timestamp
	purple: (text: string): string => `\x1b[35m${text}\x1b[0m`, // UUID
	cyan: (text: string): string => `\x1b[36m${text}\x1b[0m`, // Message 색상
	white: (text: string): string => `\x1b[37m${text}\x1b[0m`, // 기본 텍스트
};

const consoleFormat = winston.format.printf((info) => {
	const { timestamp, level, message, context, ...meta } = info;

	// 이모지 매핑
	const plainLevel = info[Symbol.for('level')] as string;
	const emoji = emojiMap[plainLevel] || '📝';

	// 현재 HTTP 요청의 traceId 가져오기
	const cls = ClsServiceManager.getClsService();
	const traceId: string | null = cls.isActive() ? cls.get('traceId') : null;

	// UUID 할당
	const currentUuid = String(traceId || crypto.randomUUID());
	const shortUuid = currentUuid.replace(/-/g, '').substring(0, 10);

	// 메타데이터 전개
	const cleanMeta = Object.fromEntries(Object.entries(meta));
	let metaString = '';
	if (Object.keys(cleanMeta).length > 0) {
		metaString =
			'\n' +
			inspect(cleanMeta, {
				colors: true,
				depth: 4,
				breakLength: 80,
			});
	}

	// 색상
	const coloredUuid = colors.purple(`[${shortUuid}]`);
	const coloredTimestamp = colors.gray(`${timestamp}`);
	const formattedContext = context ? `[${context}]` : '[App]';
	const coloredMessage = colors.cyan(String(message));

	return `${coloredUuid} ${coloredTimestamp} ${emoji} ${level} ${formattedContext} - ${coloredMessage} ${metaString}`;
});

// 공통 파일 포맷 (JSON)
const fileFormat = winston.format.combine(
	winston.format.timestamp(),
	winston.format.json(), // JSON 형태로 저장
);

// Console 출력 포맷(local을 포함한 전체)
const transports: winston.transport[] = [
	new winston.transports.Console({
		level: level,
		format: winston.format.combine(winston.format.colorize(), consoleFormat),
	}),
];

const exceptionHandlers: winston.transport[] = [];
const rejectionHandlers: winston.transport[] = [];

if (!isLocal) {
	transports.push(
		// info 이상 로그 메시지 일자별 파일 생성
		new DailyRotateFile({
			level: 'info',
			dirname: './logs/application',
			filename: '%DATE%_application.log',
			datePattern: 'YYYYMMDD',
			maxSize: '20m', // 20mb 마다 파일 분할
			zippedArchive: true, // 지난 로그 gzip 압축
			// maxFiles: '30d' // 30일 지난 로그 삭제
			format: fileFormat,
		}),
		// error 레벨의 로그 메시지 일자별 파일 생성
		new winston.transports.File({
			level: 'error',
			dirname: './logs/error',
			filename: `${getTodayString(false)}_error.log`,
			// datePattern: 'YYYYMMDD',
			zippedArchive: true,
			format: fileFormat,
			lazy: true,
		}),
	);

	exceptionHandlers.push(
		// 처리되지 않은 예외 (동기)
		new winston.transports.File({
			dirname: './logs/exceptions',
			filename: `${getTodayString(false)}_exception.log`,
			// datePattern: 'YYYYMMDD',
			zippedArchive: true,
			format: fileFormat,
			lazy: true,
		}),
	);

	rejectionHandlers.push(
		// 미처리된 Promise 예외 (비동기)
		new winston.transports.File({
			dirname: './logs/rejections',
			filename: `${getTodayString(false)}_rejection.log`,
			// datePattern: 'YYYYMMDD',
			zippedArchive: true,
			format: fileFormat,
			lazy: true,
		}),
	);
}

export const coreLogger = winston.createLogger({
	level,
	format: winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.json()),
	// 콘솔 출력 설정
	transports,
	exceptionHandlers,
	rejectionHandlers,
});
