/**
 * 표준 API 응답 구조를 정의하는 인터페이스입니다.
 */
export interface ApiResponse<T> {
	readonly success: boolean;
	readonly statusCode: number;
	readonly message: string | string[] | object; // 에러 메시지는 배열이나 객체일 수 있음
	readonly data: T | null;
	readonly timestamp: string;
}
