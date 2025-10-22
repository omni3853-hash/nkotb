import { MembershipPlanService } from "../membershipPlan.service";
import { IMembershipPlan, MembershipPlan } from "@/lib/models/membershipPlan.model";
import { CreateMembershipPlanDto, MembershipPlanQueryDto, UpdateMembershipPlanDto } from "@/lib/dto/membershipPlan.dto";
import { CustomError } from "@/lib/utils/customError.utils";
import { logAudit } from "@/lib/utils/auditLogger";
import NotificationServiceImpl from "@/lib/services/impl/notification.service.impl";
import { CreateNotificationDto } from "@/lib/dto/notification.dto";

class MembershipPlanServiceImpl implements MembershipPlanService {
    private notif = new NotificationServiceImpl();

    async create(adminId: string, dto: CreateMembershipPlanDto): Promise<IMembershipPlan> {
        const plan = new MembershipPlan(dto as any);
        await plan.save();

        await logAudit({ user: adminId, action: "CREATE", resource: "MEMBERSHIP_PLAN", resourceId: plan._id, description: `Created plan ${plan.name}` });
        await this.notif.create(new CreateNotificationDto({ user: adminId, type: "PLAN", title: "Plan created", message: `Plan ${plan.name} created.` }));

        return plan;
    }

    async update(adminId: string, id: string, dto: UpdateMembershipPlanDto): Promise<IMembershipPlan> {
        const plan = await MembershipPlan.findById(id);
        if (!plan) throw new CustomError(404, "Plan not found");

        // if period→CUSTOM, ensure durationDays exists
        if (dto.period === "CUSTOM" && (dto.durationDays ?? 0) < 1) {
            throw new CustomError(400, "durationDays is required for CUSTOM period");
        }

        Object.assign(plan, dto);
        await plan.save();

        await logAudit({ user: adminId, action: "UPDATE", resource: "MEMBERSHIP_PLAN", resourceId: id, description: `Updated plan ${plan.name}` });
        await this.notif.create(new CreateNotificationDto({ user: adminId, type: "PLAN", title: "Plan updated", message: `Plan ${plan.name} updated.` }));

        return plan;
    }

    async delete(adminId: string, id: string): Promise<void> {
        const plan = await MembershipPlan.findById(id);
        if (!plan) throw new CustomError(404, "Plan not found");

        await MembershipPlan.findByIdAndDelete(id);

        await logAudit({ user: adminId, action: "DELETE", resource: "MEMBERSHIP_PLAN", resourceId: id, description: `Deleted plan ${plan.name}` });
        await this.notif.create(new CreateNotificationDto({ user: adminId, type: "PLAN", title: "Plan deleted", message: `Plan ${plan.name} deleted.` }));
    }

    async getById(id: string): Promise<IMembershipPlan> {
        const p = await MembershipPlan.findById(id);
        if (!p) throw new CustomError(404, "Plan not found");
        return p;
    }

    async list(query: MembershipPlanQueryDto) {
        const { search, onlyActive = true, page = 1, limit = 10 } = query;
        const filter: any = {};
        if (onlyActive) filter.isActive = true;
        if (search) filter.$text = { $search: search };

        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            MembershipPlan.find(filter).sort({ popular: -1, price: 1 }).skip(skip).limit(limit),
            MembershipPlan.countDocuments(filter),
        ]);

        return { items, total, page, limit };
    }

    async toggleActive(adminId: string, id: string, isActive: boolean): Promise<IMembershipPlan> {
        const plan = await MembershipPlan.findById(id);
        if (!plan) throw new CustomError(404, "Plan not found");

        plan.isActive = isActive;
        await plan.save();

        await logAudit({ user: adminId, action: "UPDATE", resource: "MEMBERSHIP_PLAN", resourceId: id, description: `Set active=${isActive}` });
        await this.notif.create(new CreateNotificationDto({ user: adminId, type: "PLAN", title: "Plan visibility changed", message: `Plan ${plan.name} is now ${isActive ? "ACTIVE" : "INACTIVE"}.` }));

        return plan;
    }

    async setPopular(adminId: string, id: string, popular: boolean): Promise<IMembershipPlan> {
        const plan = await MembershipPlan.findById(id);
        if (!plan) throw new CustomError(404, "Plan not found");

        plan.popular = popular;
        await plan.save();

        await logAudit({ user: adminId, action: "UPDATE", resource: "MEMBERSHIP_PLAN", resourceId: id, description: `Set popular=${popular}` });
        await this.notif.create(new CreateNotificationDto({ user: adminId, type: "PLAN", title: "Plan popular flag changed", message: `Plan ${plan.name} popular=${popular}.` }));

        return plan;
    }
}

export default MembershipPlanServiceImpl;
