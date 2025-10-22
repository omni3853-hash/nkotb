import { IMembership } from "@/lib/models/membership.model";
import { CreateMembershipDto, MembershipQueryDto, UpdateMembershipStatusDto, UpgradeMembershipDto } from "@/lib/dto/membership.dto";

export interface MembershipService {
    // user actions
    create(userId: string, dto: CreateMembershipDto): Promise<IMembership>;
    upgrade(userId: string, dto: UpgradeMembershipDto): Promise<IMembership>;
    myMemberships(userId: string, query: MembershipQueryDto): Promise<{ items: IMembership[]; total: number; page: number; limit: number }>;
    getMyMembershipById(userId: string, id: string): Promise<IMembership>;
    cancelAutoRenew(userId: string, id: string): Promise<IMembership>;

    // admin actions
    adminList(query: MembershipQueryDto): Promise<{ items: IMembership[]; total: number; page: number; limit: number }>;
    adminGetById(id: string): Promise<IMembership>;
    adminUpdateStatus(adminId: string, id: string, dto: UpdateMembershipStatusDto): Promise<IMembership>;
}
