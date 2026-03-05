import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptors';
import { HttpExceptionFilter } from './common/exception/http-exception.filter';
import cookieParser from 'cookie-parser';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

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
