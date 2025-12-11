import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { User } from '../../users/entities/user.entity';
import { Club } from '../../clubs/entities/club.entity';

@Injectable()
export class FileStorageService {
  private dataDir = path.join(process.cwd(), 'src', 'data');
  private usersFile = path.join(this.dataDir, 'users.json');
  private clubsFile = path.join(this.dataDir, 'clubs.json');

  constructor() {
    this.initializeStorage();
  }

  private initializeStorage(): void {
    // data 폴더가 없으면 생성
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    // users.json이 없으면 초기화
    if (!fs.existsSync(this.usersFile)) {
      fs.writeFileSync(this.usersFile, JSON.stringify([], null, 2));
    }

    // clubs.json이 없으면 초기화
    if (!fs.existsSync(this.clubsFile)) {
      fs.writeFileSync(this.clubsFile, JSON.stringify([], null, 2));
    }
  }

  getAllUsers(): User[] {
    const data = fs.readFileSync(this.usersFile, 'utf-8');
    return JSON.parse(data);
  }

  getUserByEmail(email: string): User | null {
    const users = this.getAllUsers();
    return users.find((user) => user.email === email) || null;
  }

  getUserById(id: string): User | null {
    const users = this.getAllUsers();
    return users.find((user) => user.id === id) || null;
  }

  saveUser(user: User): void {
    const users = this.getAllUsers();
    users.push(user);
    fs.writeFileSync(this.usersFile, JSON.stringify(users, null, 2));
  }

  updateUser(id: string, updatedUser: Partial<User>): User | null {
    const users = this.getAllUsers();
    const index = users.findIndex((user) => user.id === id);

    if (index === -1) {
      return null;
    }

    users[index] = { ...users[index], ...updatedUser };
    fs.writeFileSync(this.usersFile, JSON.stringify(users, null, 2));
    return users[index];
  }

  deleteUser(id: string): boolean {
    const users = this.getAllUsers();
    const index = users.findIndex((user) => user.id === id);

    if (index === -1) {
      return false;
    }

    users.splice(index, 1);
    fs.writeFileSync(this.usersFile, JSON.stringify(users, null, 2));
    return true;
  }

  // Club 관련 메서드
  getAllClubs(): Club[] {
    const data = fs.readFileSync(this.clubsFile, 'utf-8');
    return JSON.parse(data);
  }

  getClubById(id: string): Club | null {
    const clubs = this.getAllClubs();
    return clubs.find((club) => club.id === id) || null;
  }

  saveClub(club: Club): void {
    const clubs = this.getAllClubs();
    clubs.push(club);
    fs.writeFileSync(this.clubsFile, JSON.stringify(clubs, null, 2));
  }

  updateClub(id: string, updatedClub: Partial<Club>): Club | null {
    const clubs = this.getAllClubs();
    const index = clubs.findIndex((club) => club.id === id);

    if (index === -1) {
      return null;
    }

    clubs[index] = { ...clubs[index], ...updatedClub };
    fs.writeFileSync(this.clubsFile, JSON.stringify(clubs, null, 2));
    return clubs[index];
  }

  deleteClub(id: string): boolean {
    const clubs = this.getAllClubs();
    const index = clubs.findIndex((club) => club.id === id);

    if (index === -1) {
      return false;
    }

    clubs.splice(index, 1);
    fs.writeFileSync(this.clubsFile, JSON.stringify(clubs, null, 2));
    return true;
  }
}
