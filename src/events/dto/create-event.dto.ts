export class CreateEventDto {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  maxAttendees?: number;
}
