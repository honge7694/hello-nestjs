import { DataSource, Repository } from 'typeorm';
import { AuthToken } from '../entities/auth-token.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthTokenRepository extends Repository<AuthToken> {
	constructor(private readonly dataSource: DataSource) {
		super(AuthToken, dataSource.createEntityManager());
	}
}
