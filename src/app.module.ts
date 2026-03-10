import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './common/database/database.module';
import { ClsModule } from 'nestjs-cls';
import { APP_GUARD } from '@nestjs/core';
import { JwtAccessAuthGuard } from './auth/guard/jwt-access-token.guard';
import { LoggerMiddleware } from './custom-logger/middlewares/logger.middleware';

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
				setup: (cls, req) => {
					cls.set('traceId', crypto.randomUUID());
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

				// Entity 자동 로드
				autoLoadEntities: true,
				// ddl-create와 같은 옵션 (테스트 환경에서만 true)
				synchronize: configService.get<string>('NODE_ENV') !== 'production',
				// 쿼리 로깅
				logging: configService.get<string>('NODE_ENV') !== 'production',
				// Connection Pool 설정
				extra: {
					//max: 20, // 최대 커넥션 수
					idleTimeoutMillis: 30000, // 유휴 커넥션 유지 시간
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
