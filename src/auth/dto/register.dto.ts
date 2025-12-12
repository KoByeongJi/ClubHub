import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user1@example.com' })
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  password: string;

  @ApiProperty({ example: '홍길동' })
  name: string;
}
