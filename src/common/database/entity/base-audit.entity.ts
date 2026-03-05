import { Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class BaseAuditEntity {
	@CreateDateColumn({
		name: 'create_date',
		type: 'timestamp',
	})
		createDate: Date;

	@UpdateDateColumn({
		name: 'update_date',
		type: 'timestamp',
	})
		updateDate: Date;

	@Column({
		name: 'create_user_id',
		type: 'varchar',
		length: 50,
		nullable: true,
	})
		createUserId: string;

	@Column({
		name: 'create_user_code',
		type: 'varchar',
		length: 50,
		nullable: true,
	})
		createUserCode: string;

	@Column({
		name: 'update_user_id',
		type: 'varchar',
		length: 50,
		nullable: true,
	})
		updateUserId: string;

	@Column({
		name: 'update_user_code',
		type: 'varchar',
		length: 50,
		nullable: true,
	})
		updateUserCode: string;

	@Column({
		type: 'varchar',
		length: 10,
		default: 'ACT',
	})
		status: string;

	@Column({
		type: 'varchar',
		length: 4000,
		nullable: true,
	})
		description: string;
}
