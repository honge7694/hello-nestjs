/**
 * JWT 토큰의 payload
 */
export interface JwtPayload {
	/* Subject: 사용자를 식별하는 고유 코드 (PK) */
	sub: string;
	/* 사용자의 로그인 아이디 */
	userId: string;
	/* 사용자의 권한 */
	role: string;
}
