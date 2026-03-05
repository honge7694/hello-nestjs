# JWT 인증 시스템 아키텍처 (NestJS)

본 프로젝트는 보안성과 확장성을 고려하여 **3-Strategy 인증 구조**와 **RTR(Refresh Token Rotation)** 전략을 채택하여 구현되었습니다.

---

## 1. 3-Strategy 인증 아키텍처

인증 과정을 세 가지 단계로 분리하여 각 역할에 충실한 전략을 사용합니다.

### ① LocalStrategy (`local`)
- **역할**: 아이디/비밀번호 기반의 최초 로그인 검증.
- **동작**: `AuthService.validateUser`를 호출하여 DB의 사용자 정보와 비밀번호(bcrypt 해시)를 대조합니다.
- **결과**: 검증 성공 시 사용자 객체(`ValidatedUser`)를 반환하여 `req.user`에 주입합니다.

### ② JwtAccessTokenStrategy (`jwt`)
- **역할**: API 요청 시 Access Token의 유효성 검증.
- **추출 방식**: `Authorization: Bearer <Token>` (Header)
- **특징**: 짧은 유효 기간을 가지며, Stateless한 요청 처리를 담당합니다.

### ③ JwtRefreshTokenStrategy (`refresh_token`)
- **역할**: Access Token 만료 시 새로운 토큰 세트를 발급받기 위한 검증.
- **추출 방식**: `req.cookies.refreshToken` (HttpOnly Cookie)
- **특징**: 보안을 위해 클라이언트 자바스크립트에서 접근할 수 없는 **HttpOnly 쿠키**를 사용하여 탈취 위험을 최소화합니다.

---

## 2. RTR (Refresh Token Rotation) 전략

보안성을 극대화하기 위해 **Refresh Token Rotation** 방식을 적용했습니다.

- **개념**: Refresh Token을 사용하여 Access Token을 재발급할 때, 기존의 Refresh Token도 함께 무효화하고 **새로운 Refresh Token을 재발급**합니다.
- **장점**: 만약 Refresh Token이 탈취되더라도, 공격자가 사용하기 전에 사용자가 정상적으로 토큰을 갱신하면 공격자의 토큰은 무효화되어 더 이상의 접근이 차단됩니다.
- **구현**: 
  - `/auth/refresh` 요청 시 DB에 저장된 해시값과 대조.
  - 검증 완료 후 기존 토큰 삭제/갱신 및 새 토큰 쿠키 전송.

---

## 3. 데이터 보안 및 관리

### ① 독립된 토큰 엔티티 (`AuthToken`)
- **관심사 분리**: `User` 엔티티와 분리하여 토큰 관리 전용 엔티티를 운영합니다.
- **해싱 저장**: DB 유출 시를 대비하여 Refresh Token 원본이 아닌 **bcrypt로 해싱된 값**을 저장합니다.

### ② 세션 메타데이터 추적
보안 로그 및 의심스러운 로그인 감지를 위해 다음 정보를 함께 저장합니다.
- **IP 주소**: 토큰이 발급된 시점의 IP.
- **기기 정보**: `ua-parser-js`를 사용하여 브라우저, OS, 기기 종류(Mobile/Desktop)를 분석하여 저장.

---

## 4. 사용 라이브러리 및 기술 스택

| 라이브러리 | 용도 |
| :--- | :--- |
| `@nestjs/jwt` | JWT 생성 및 검증을 위한 NestJS 공식 모듈 |
| `passport-jwt` | JWT 기반 인증 전략 구현 |
| `bcrypt` | 비밀번호 및 Refresh Token 해싱 (단방향 암호화) |
| `ua-parser-js` | User-Agent 분석을 통한 기기 정보 추출 |
| `ms` | `"7d"`, `"1h"` 등 문자열 형태의 시간을 밀리초/초로 변환 |
| `cookie-parser` | 쿠키 기반 Refresh Token 처리를 위한 미들웨어 |

---

## 5. 보안 설정 (Security Best Practices)

- **HttpOnly & Secure Cookie**: Refresh Token은 XSS 공격 방지를 위해 스크립트 접근이 금지된 쿠키에 저장됩니다.
- **SameSite 정책**: CSRF 공격을 방지하기 위해 `SameSite: 'Strict'` (또는 개발 환경에 따라 `None`) 설정을 적용합니다.
- **Strict Typing**: 모든 인증 프로세스에 `ValidatedUser`, `LoginMetadata` 등 인터페이스를 적용하여 타입 안정성을 확보했습니다.
