import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // 입력값 검증
    if (!registerDto.email || !registerDto.password || !registerDto.name) {
      throw new BadRequestException(
        '이메일, 비밀번호, 이름이 모두 필요합니다.',
      );
    }

    if (registerDto.password.length < 6) {
      throw new BadRequestException('비밀번호는 최소 6자 이상이어야 합니다.');
    }

    try {
      const user = await this.usersService.create(
        registerDto.email,
        registerDto.password,
        registerDto.name,
      );
      return {
        message: '회원가입이 완료되었습니다.',
        user,
      };
    } catch (error) {
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 입력값 검증
    if (!email || !password) {
      throw new BadRequestException('이메일과 비밀번호가 필요합니다.');
    }

    // 사용자 찾기
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('존재하지 않는 이메일입니다.');
    }

    // 비밀번호 검증
    const isPasswordValid = await this.usersService.validatePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    // JWT 토큰 생성
    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload, {
      expiresIn: '24h',
    });

    // 비밀번호 제외하고 반환
    const { password: _, ...userWithoutPassword } = user;
    return {
      message: '로그인이 완료되었습니다.',
      user: userWithoutPassword,
      access_token,
    };
  }

  async validateUser(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getCurrentUser(req: any) {
    const user = await this.usersService.findById(req.user.sub);
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
