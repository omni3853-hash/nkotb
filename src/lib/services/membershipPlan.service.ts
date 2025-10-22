import { IMembershipPlan } from "@/lib/models/membershipPlan.model";
import { CreateMembershipPlanDto, MembershipPlanQueryDto, UpdateMembershipPlanDto } from "@/lib/dto/membershipPlan.dto";

export interface MembershipPlanService {
  create(adminId: string, dto: CreateMembershipPlanDto): Promise<IMembershipPlan>;
  update(adminId: string, id: string, dto: UpdateMembershipPlanDto): Promise<IMembershipPlan>;
  delete(adminId: string, id: string): Promise<void>;
  getById(id: string): Promise<IMembershipPlan>;
  list(query: MembershipPlanQueryDto): Promise<{ items: IMembershipPlan[]; total: number; page: number; limit: number }>;
  toggleActive(adminId: string, id: string, isActive: boolean): Promise<IMembershipPlan>;
  setPopular(adminId: string, id: string, popular: boolean): Promise<IMembershipPlan>;
}
