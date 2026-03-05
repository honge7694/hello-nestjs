import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent } from 'typeorm';
import { ClsService, ClsStore } from 'nestjs-cls';
import { BaseAuditEntity } from '../entity/base-audit.entity';
import { ValidatedUser } from '../../../auth/interface/validated-user.interface';

/**
 * CLS 컨텍스트 내부에 저장될 데이터의 인터페이스입니다.
 */
interface MyClsStore extends ClsStore {
	currentUser?: ValidatedUser;
}

@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface<BaseAuditEntity> {
	constructor(private readonly clsService: ClsService<MyClsStore>) {}

	listenTo(): typeof BaseAuditEntity {
		return BaseAuditEntity;
	}

	// INSERT 되기 직전에 실행
	beforeInsert(event: InsertEvent<BaseAuditEntity>): void {
		const currentUser = this.clsService.get('currentUser');

		if (currentUser && event.entity) {
			event.entity.createUserId = currentUser.userId;
			event.entity.createUserCode = currentUser.code;
			event.entity.updateUserId = currentUser.userId;
			event.entity.updateUserCode = currentUser.code;
		}
	}

	// UPDATE 되기 직전에 실행
	beforeUpdate(event: UpdateEvent<BaseAuditEntity>): void {
		const currentUser = this.clsService.get('currentUser');
		const entity = event.entity as BaseAuditEntity | undefined;

		if (currentUser && entity) {
			entity.updateUserId = currentUser.userId;
			entity.updateUserCode = currentUser.code;
		}
	}
}
