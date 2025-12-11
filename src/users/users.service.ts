import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole } from './entities/user.entity';
import { FileStorageService } from '../common/services/file-storage.service';

@Injectable()
export class UsersService {
  constructor(private fileStorageService: FileStorageService) {}

  async create(email: string, password: string, name: string): Promise<User> {
    // 이메일 중복 체크
    const existingUser = this.fileStorageService.getUserByEmail(email);
    if (existingUser) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 새로운 사용자 생성
    const user: User = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      name,
      role: UserRole.USER,
      createdAt: new Date(),
    };

    // 파일에 저장
    this.fileStorageService.saveUser(user);

    // 비밀번호 제외하고 반환
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as any;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.fileStorageService.getUserByEmail(email);
  }

  async findById(id: string): Promise<User | null> {
    return this.fileStorageService.getUserById(id);
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async findAll(): Promise<User[]> {
    return this.fileStorageService.getAllUsers();
  }

  async update(id: string, updateData: Partial<User>): Promise<User | null> {
    return this.fileStorageService.updateUser(id, updateData);
  }

  async remove(id: string): Promise<boolean> {
    return this.fileStorageService.deleteUser(id);
  }

  async makeAdmin(id: string): Promise<User | null> {
    return this.fileStorageService.updateUser(id, { role: UserRole.ADMIN });
  }
}
