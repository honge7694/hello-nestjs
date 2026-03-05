import { BaseAuditEntity } from 'src/common/database/entity/base-audit.entity';
import { Role } from 'src/users/enum/Role';
import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';

@Entity('UserToken')
export class AuthToken extends BaseAuditEntity {
	@Generated('increment')
	id: number;

	@Column({
		type: 'varchar',
		length: 50,
		nullable: false,
	})
	userCode: string;

	@Column({
		type: 'varchar',
		nullable: false,
	})
	userId: string;

	@Column({
		enum: Object.values(Role),
		type: 'varchar',
		nullable: false,
	})
	role: string;

	@PrimaryColumn({
		type: 'varchar',
		nullable: false,
	})
	refreshToken: string;

	@Column({
		type: 'timestamp',
		nullable: false,
	})
	refreshTokenCreateDate: Date;

	@Column({
		type: 'number',
		nullable: false,
	})
	refreshTokenExpireSeconds: number;

	@Column({
		type: 'timestamp',
		nullable: false,
	})
	refreshTokenExpireDate: Date;

	@Column({
		type: 'varchar',
		nullable: false,
	})
	tokenIssuedIpAddress: string;

	@Column({
		type: 'varchar',
		nullable: false,
	})
	tokenIssuedBrowser: string;

	@Column({
		type: 'varchar',
		nullable: false,
	})
	tokenIssuedDevice: string;

	@Column({
		type: 'varchar',
		nullable: false,
	})
	tokenIssuedOsName: string;
}
