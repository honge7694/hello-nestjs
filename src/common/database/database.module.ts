import { Global, Module } from '@nestjs/common';
import { AuditSubscriber } from './subscribers/AuditSubscriber';

@Global() // 전역 모듈로 설정하여 다른 곳에서 import 없이 적용
@Module({ providers: [AuditSubscriber] })

export class DatabaseModule {}
