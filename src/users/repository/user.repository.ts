import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
	constructor(private readonly dataSource: DataSource) {
		super(User, dataSource.createEntityManager());
	}

	async findByUserId(userId: string): Promise<User | null> {
		return await this.findOne({
			where: {
				userId: userId,
				status: 'ACT',
			},
		});
	}
}
