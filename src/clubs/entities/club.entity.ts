export class Club {
  id: string;
  name: string;
  description: string;
  ownerId: string; // 회장(개설자) 사용자 ID
  createdAt: Date;
}
