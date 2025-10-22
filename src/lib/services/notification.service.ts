import { INotification } from '@/lib/models/notification.model';
import { CreateNotificationDto, UpdateNotificationDto, NotificationQueryDto } from '@/lib/dto/notification.dto';

export interface NotificationService {
    // Admin
    create(data: CreateNotificationDto): Promise<INotification>;
    adminList(query: NotificationQueryDto): Promise<{ items: INotification[]; total: number; page: number; limit: number }>;
    update(id: string, data: UpdateNotificationDto): Promise<INotification>;
    delete(id: string): Promise<void>;
    getById(id: string): Promise<INotification>;

    // User
    myList(userId: string, query: NotificationQueryDto): Promise<{ items: INotification[]; total: number; page: number; limit: number }>;
    markRead(id: string, userId: string): Promise<INotification>;
    markAllRead(userId: string): Promise<number>;
}
