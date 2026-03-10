import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/exception/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptors';
import { CustomNestLogger } from './custom-logger/adapters/nest.adapter';

async function bootstrap() {
	// const app = await NestFactory.create(AppModule);
	const app = await NestFactory.create(AppModule, {
		logger: new CustomNestLogger(), // 기본 Logger 교체
	});

	// 전역 인터셉터 적용 (성공 응답)
	app.useGlobalInterceptors(new TransformInterceptor());

	// 전역 필터 적용 (실패 응답)
	app.useGlobalFilters(new HttpExceptionFilter());

	// CORS
	app.enableCors({
		origin: 'http://localhost:3001',
		credentials: true,
	});

	// Cookie
	app.use(cookieParser());

	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
