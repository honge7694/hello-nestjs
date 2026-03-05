export class CreateUserDto {
	readonly code: string;
	readonly role: string;
	readonly userId: string;
	readonly password: string;

	readonly name: string;
	readonly phone: string;
	readonly email: string;
}
