import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import { ClsModule } from 'nestjs-cls';
import { AuthModule } from './auth/auth.module';
import { JwtAccessAuthGuard } from './auth/guard/jwt-access-token.guard';
import { DatabaseModule } from './common/database/database.module';
import { CustomTypeOrmLogger } from './custom-logger/adapters/typeorm.adapter';
import { LoggerMiddleware } from './custom-logger/middlewares/logger.middleware';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: [`.env.${process.env.NODE_ENV || 'local'}`, '.env'],
		}),

		ClsModule.forRoot({
			global: true,
			middleware: {
				mount: true,
				setup: (cls, req: Request, res: Response) => {
					const traceId = crypto.randomUUID();
					cls.set('traceId', traceId);
					res.setHeader('X-Trace-Id', traceId);
				},
			}, // 모든 요청마다 자동으로 CLS 컨텍스트 생성
		}),

		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				type: 'oracle',
				host: configService.get<string>('DB_HOST'),
				port: configService.get<number>('DB_PORT'),
				username: configService.get<string>('DB_USERNAME'),
				password: configService.get<string>('DB_PASSWORD'),
				serviceName: configService.get<string>('DB_SERVICE_NAME'),

				// 커스텀 로그 기록
				logger: new CustomTypeOrmLogger(),
				// 쿼리 로깅
				logging: configService.get<string>('NODE_ENV') !== 'production',

				// Entity 자동 로드
				autoLoadEntities: true,
				// ddl-create와 같은 옵션 (테스트 환경에서만 true)
				synchronize: configService.get<string>('NODE_ENV') !== 'production',
				// Connection Pool 설정
				extra: {
					poolMin: 0,           // 풀(Pool)에 유지할 최소 커넥션 수
					poolMax: 20,          // 풀(Pool)의 최대 커넥션 수 (기존 max 대체)
					poolIncrement: 1,     // 필요 시 커넥션을 몇 개씩 추가로 생성할지 지정
					poolTimeout: 30,      // 유휴 커넥션 유지 시간 (밀리초가 아닌 '초' 단위)
					queueTimeout: 60000,  // 풀이 가득 찼을 때 큐(Queue)에서 대기할 최대 시간 (밀리초 단위)
				},
			}),
		}),
		UsersModule,
		AuthModule,
		DatabaseModule,
	],
	controllers: [],
	providers: [
		{
			provide: APP_GUARD,
			useClass: JwtAccessAuthGuard,
		},
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		// 모든 라우트('*')에 대해 LoggerMiddleware를 실행
		consumer.apply(LoggerMiddleware).forRoutes('*');
	}
}
// export class AppModule {}
