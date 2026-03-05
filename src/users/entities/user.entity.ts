import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../../common/database/entity/base-audit.entity';
import { Role } from '../enum/Role';

@Entity('Users')
export class User extends BaseAuditEntity {

    @Generated('increment')
    	idx: number;

    @PrimaryColumn({
    	type: 'varchar',
    	length: 50,
    	unique: true,
    	nullable: false, 
    })
    	code: string;

    @Column({
    	enum: Object.values(Role),
    	type: 'varchar',
    	length: 10,
    	nullable: false, 
    })
    	role: string;

    @Column({
    	type: 'varchar',
    	length: 50,
    	unique: true,
    	nullable: false, 
    })
    	userId: string;

    @Column({
    	type: 'varchar',
    	length: 100,
    	nullable: false, 
    })
    	password: string;

    @Column({
    	type: 'varchar',
    	length: 50,
    	nullable: false, 
    })
    	name: string;

    @Column({
    	type: 'varchar',
    	length: 20, 
    })
    	phone: string;

    @Column({
    	type: 'varchar',
    	length: 100, 
    })
    	email: string;
}
