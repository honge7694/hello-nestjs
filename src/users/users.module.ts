import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserRepository } from './repository/user.repository';
import { User } from './entities/user.entity';

@Module({
	imports: [TypeOrmModule.forFeature([User])],
	controllers: [UsersController],
	providers: [UsersService, UserRepository],
	exports: [TypeOrmModule,
		UsersService,
		UserRepository],
})
export class UsersModule {}
