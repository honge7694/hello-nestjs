/**
 * DB 조회 후 검증 완료한 유저 객체 타입
 */
export interface ValidatedUser {
	code: string;
	userId: string;
	role: string;
}
