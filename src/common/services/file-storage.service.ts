import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { User } from '../../users/entities/user.entity';
import { Club } from '../../clubs/entities/club.entity';
import { Member } from '../../members/entities/member.entity';
import { Event, Notification } from '../../events/entities/event.entity';

@Injectable()
export class FileStorageService {
  private dataDir = path.join(process.cwd(), 'src', 'data');
  private usersFile = path.join(this.dataDir, 'users.json');
  private clubsFile = path.join(this.dataDir, 'clubs.json');
  private membersFile = path.join(this.dataDir, 'members.json');
  private eventsFile = path.join(this.dataDir, 'events.json');
  private notificationsFile = path.join(this.dataDir, 'notifications.json');

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

    // members.json이 없으면 초기화
    if (!fs.existsSync(this.membersFile)) {
      fs.writeFileSync(this.membersFile, JSON.stringify([], null, 2));
    }

    // events.json이 없으면 초기화
    if (!fs.existsSync(this.eventsFile)) {
      fs.writeFileSync(this.eventsFile, JSON.stringify([], null, 2));
    }

    // notifications.json이 없으면 초기화
    if (!fs.existsSync(this.notificationsFile)) {
      fs.writeFileSync(this.notificationsFile, JSON.stringify([], null, 2));
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

  // Member 관련 메서드
  getAllMembers(): Member[] {
    const data = fs.readFileSync(this.membersFile, 'utf-8');
    return JSON.parse(data);
  }

  getMemberById(id: string): Member | null {
    const members = this.getAllMembers();
    return members.find((member) => member.id === id) || null;
  }

  getMembersByClubId(clubId: string): Member[] {
    const members = this.getAllMembers();
    return members.filter((member) => member.clubId === clubId);
  }

  getMemberByUserAndClub(userId: string, clubId: string): Member | null {
    const members = this.getAllMembers();
    return (
      members.find(
        (member) => member.userId === userId && member.clubId === clubId,
      ) || null
    );
  }

  saveMember(member: Member): void {
    const members = this.getAllMembers();
    members.push(member);
    fs.writeFileSync(this.membersFile, JSON.stringify(members, null, 2));
  }

  updateMember(id: string, updatedMember: Partial<Member>): Member | null {
    const members = this.getAllMembers();
    const index = members.findIndex((member) => member.id === id);

    if (index === -1) {
      return null;
    }

    members[index] = { ...members[index], ...updatedMember };
    fs.writeFileSync(this.membersFile, JSON.stringify(members, null, 2));
    return members[index];
  }

  deleteMember(id: string): boolean {
    const members = this.getAllMembers();
    const index = members.findIndex((member) => member.id === id);

    if (index === -1) {
      return false;
    }

    members.splice(index, 1);
    fs.writeFileSync(this.membersFile, JSON.stringify(members, null, 2));
    return true;
  }

  // Event 관련 메서드
  getAllEvents(): Event[] {
    const data = fs.readFileSync(this.eventsFile, 'utf-8');
    return JSON.parse(data);
  }

  getEventById(id: string): Event | null {
    const events = this.getAllEvents();
    return events.find((event) => event.id === id) || null;
  }

  getEventsByClubId(clubId: string): Event[] {
    const events = this.getAllEvents();
    return events.filter((event) => event.clubId === clubId);
  }

  saveEvent(event: Event): void {
    const events = this.getAllEvents();
    events.push(event);
    fs.writeFileSync(this.eventsFile, JSON.stringify(events, null, 2));
  }

  updateEvent(id: string, updatedEvent: Partial<Event>): Event | null {
    const events = this.getAllEvents();
    const index = events.findIndex((event) => event.id === id);

    if (index === -1) {
      return null;
    }

    events[index] = {
      ...events[index],
      ...updatedEvent,
      updatedAt: new Date(),
    };
    fs.writeFileSync(this.eventsFile, JSON.stringify(events, null, 2));
    return events[index];
  }

  deleteEvent(id: string): boolean {
    const events = this.getAllEvents();
    const index = events.findIndex((event) => event.id === id);

    if (index === -1) {
      return false;
    }

    events.splice(index, 1);
    fs.writeFileSync(this.eventsFile, JSON.stringify(events, null, 2));
    return true;
  }

  // Notification 관련 메서드
  getAllNotifications(): Notification[] {
    const data = fs.readFileSync(this.notificationsFile, 'utf-8');
    return JSON.parse(data);
  }

  getNotificationById(id: string): Notification | null {
    const notifications = this.getAllNotifications();
    return notifications.find((notif) => notif.id === id) || null;
  }

  getNotificationsByEventId(eventId: string): Notification[] {
    const notifications = this.getAllNotifications();
    return notifications.filter((notif) => notif.eventId === eventId);
  }

  getNotificationsByUserId(userId: string): Notification[] {
    const notifications = this.getAllNotifications();
    return notifications.filter((notif) => notif.userId === userId);
  }

  saveNotification(notification: Notification): void {
    const notifications = this.getAllNotifications();
    notifications.push(notification);
    fs.writeFileSync(
      this.notificationsFile,
      JSON.stringify(notifications, null, 2),
    );
  }

  updateNotification(
    id: string,
    updatedNotification: Partial<Notification>,
  ): Notification | null {
    const notifications = this.getAllNotifications();
    const index = notifications.findIndex((notif) => notif.id === id);

    if (index === -1) {
      return null;
    }

    notifications[index] = { ...notifications[index], ...updatedNotification };
    fs.writeFileSync(
      this.notificationsFile,
      JSON.stringify(notifications, null, 2),
    );
    return notifications[index];
  }

  deleteNotification(id: string): boolean {
    const notifications = this.getAllNotifications();
    const index = notifications.findIndex((notif) => notif.id === id);

    if (index === -1) {
      return false;
    }

    notifications.splice(index, 1);
    fs.writeFileSync(
      this.notificationsFile,
      JSON.stringify(notifications, null, 2),
    );
    return true;
  }
}
