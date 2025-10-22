import mongoose, { ClientSession } from 'mongoose';
import { NotificationService } from '../notification.service';
import { INotification, Notification } from '@/lib/models/notification.model';
import { CreateNotificationDto, UpdateNotificationDto, NotificationQueryDto } from '@/lib/dto/notification.dto';
import { CustomError } from '@/lib/utils/customError.utils';
import { User } from '@/lib/models/user.model';

class NotificationServiceImpl implements NotificationService {
    async create(data: CreateNotificationDto, session?: ClientSession): Promise<INotification> {
        const user = await User.findById(data.user).session(session || null);
        if (!user) throw new CustomError(404, 'User not found');

        const notif = new Notification({
            user: data.user,
            type: data.type,
            title: data.title,
            message: data.message,
            read: false,
        });

        await notif.save({ session });
        // populate with the same session to avoid "Query was already executed" edge cases
        await notif.populate({ path: 'user', select: 'firstName lastName email userName', options: { session } });
        return notif;
    }

    async adminList(query: NotificationQueryDto, session?: ClientSession) {
        const { type, read, page = 1, limit = 10 } = query;
        const filter: any = {};
        if (type) filter.type = type;
        if (typeof read === 'boolean') filter.read = read;

        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            Notification.find(filter)
                .populate({ path: 'user', select: 'firstName lastName email userName', options: { session } })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .session(session || null),
            Notification.countDocuments(filter).session(session || null),
        ]);

        return { items, total, page, limit };
    }

    async myList(userId: string, query: NotificationQueryDto, session?: ClientSession) {
        const { type, read, page = 1, limit = 10 } = query;
        const filter: any = { user: userId };
        if (type) filter.type = type;
        if (typeof read === 'boolean') filter.read = read;

        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            Notification.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .session(session || null),
            Notification.countDocuments(filter).session(session || null),
        ]);

        return { items, total, page, limit };
    }

    async update(id: string, data: UpdateNotificationDto, session?: ClientSession): Promise<INotification> {
        const notif = await Notification.findById(id).session(session || null);
        if (!notif) throw new CustomError(404, 'Notification not found');

        if (data.type !== undefined) notif.type = data.type;
        if (data.title !== undefined) notif.title = data.title;
        if (data.message !== undefined) notif.message = data.message;
        if (typeof data.read === 'boolean') notif.read = data.read;

        await notif.save({ session });
        await notif.populate({ path: 'user', select: 'firstName lastName email userName', options: { session } });
        return notif;
    }

    async getById(id: string, session?: ClientSession): Promise<INotification> {
        const notif = await Notification.findById(id)
            .populate({ path: 'user', select: 'firstName lastName email userName', options: { session } })
            .session(session || null);
        if (!notif) throw new CustomError(404, 'Notification not found');
        return notif;
    }

    async delete(id: string, session?: ClientSession): Promise<void> {
        const notif = await Notification.findById(id).session(session || null);
        if (!notif) throw new CustomError(404, 'Notification not found');
        await Notification.findByIdAndDelete(id, { session });
    }

    async markRead(id: string, userId: string, session?: ClientSession): Promise<INotification> {
        const notif = await Notification.findById(id).session(session || null);
        if (!notif) throw new CustomError(404, 'Notification not found');
        if (String(notif.user) !== String(userId)) throw new CustomError(403, 'Forbidden');

        notif.read = true;
        await notif.save({ session });
        return notif;
    }

    async markAllRead(userId: string, session?: ClientSession): Promise<number> {
        const res = await Notification.updateMany(
            { user: userId, read: false },
            { $set: { read: true } },
            { session }
        );
        return res.modifiedCount ?? 0;
    }
}

export default NotificationServiceImpl;
