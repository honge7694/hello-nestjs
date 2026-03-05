import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { BusinessException } from 'src/common/exception/business.exception';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersDto } from './dto/get-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserErrorCode } from './exception/UserErrorCode';
import { UserRepository } from './repository/user.repository';

@Injectable()
export class UsersService {
	constructor(private readonly userRepository: UserRepository) {}

	/**
	 * 새로운 사용자를 생성합니다.
	 * @param createUserDto
	 */
	async createUser(createUserDto: CreateUserDto): Promise<User> {
		const { userId, password } = createUserDto;

		// 중복 아이디 확인
		const existingUser = await this.userRepository.findOne({ where: { userId } });
		if (existingUser) {
			throw new BusinessException(UserErrorCode.USER_ALREADY_EXISTS);
		}

		// 비밀번호 암호화
		const hashedPassword = await bcrypt.hash(password, 10);

		// TODO; CODE 채번 추가

		// 유저 저장
		const user = this.userRepository.create({
			...createUserDto,
			createUserId: createUserDto.userId,
			createUserCode: createUserDto.code,
			updateUserId: createUserDto.userId,
			updateUserCode: createUserDto.code,
			password: hashedPassword,
		});

		return await this.userRepository.save(user);
	}

	findAll(query: GetUsersDto) {
		return `This action returns all users ${query.limit}, ${query.offset}`;
	}

	findOne(id: number) {
		return `This action returns a #${id} user`;
	}

	update(id: number, updateUserDto: UpdateUserDto) {
		return `This action updates a #${id} user`;
	}

	remove(id: number) {
		return `This action removes a #${id} user`;
	}
}
