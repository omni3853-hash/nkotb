import { AuditService } from '../audit.service';
import { IAudit, Audit } from '@/lib/models/audit.model';
import { CreateAuditDto, AuditQueryDto } from '@/lib/dto/audit.dto';
import { CustomError } from '@/lib/utils/customError.utils';
import { User } from '@/lib/models/user.model';

export class AuditServiceImpl implements AuditService {
    async create(data: CreateAuditDto): Promise<IAudit> {
        const user = await User.findById(data.user);
        if (!user) throw new CustomError(404, 'User not found');

        const audit = new Audit({
            user: data.user,
            action: data.action,
            resource: data.resource,
            resourceId: data.resourceId,
            description: data.description,
        });
        await audit.save();
        return audit;
    }

    async getById(id: string): Promise<IAudit> {
        const item = await Audit.findById(id).populate('user', 'firstName lastName email userName');
        if (!item) throw new CustomError(404, 'Audit not found');
        return item;
    }

    async adminList(query: AuditQueryDto) {
        const { userId, action, resource, from, to, page = 1, limit = 10 } = query;
        const filter: any = {};
        if (userId) filter.user = userId;
        if (action) filter.action = action;
        if (resource) filter.resource = resource;
        if (from || to) filter.createdAt = { ...(from && { $gte: from }), ...(to && { $lte: to }) };

        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            Audit.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('user', 'firstName lastName email userName'),
            Audit.countDocuments(filter),
        ]);
        return { items, total, page, limit };
    }

    async userList(userId: string, query: AuditQueryDto) {
        const { action, resource, from, to, page = 1, limit = 10 } = query;
        const filter: any = { user: userId };
        if (action) filter.action = action;
        if (resource) filter.resource = resource;
        if (from || to) filter.createdAt = { ...(from && { $gte: from }), ...(to && { $lte: to }) };

        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            Audit.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Audit.countDocuments(filter),
        ]);
        return { items, total, page, limit };
    }
}

export default AuditServiceImpl;
