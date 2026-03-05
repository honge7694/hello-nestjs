import { Body, Controller, Get, Param, Post, Query, Redirect, UseGuards } from '@nestjs/common';
import { JwtAccessAuthGuard } from 'src/auth/guard/jwt-access-token.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersDto } from './dto/get-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Public()
	@Post()
	async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
		return this.usersService.createUser(createUserDto);
	}

	@UseGuards(JwtAccessAuthGuard)
	@Get()
	findAll(@Query() query: GetUsersDto) {
		return this.usersService.findAll(query);
	}

	@Get(':id')
	findOne(@Param('id') id: number) {
		return this.usersService.findOne(id);
	}

	@Get('redirect/users')
	@Redirect()
	getRedirectDemo(@Query('id') id: string) {
		if (id) {
			return {
				url: `http://localhost:3000/users/${+id}`,
				statusCode: 302,
			};
		}

		return {
			url: 'http://localhost:3000/users',
			statusCode: 302,
		};
	}
}
