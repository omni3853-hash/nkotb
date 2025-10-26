import type { IDepositPopulated } from "@/lib/models/deposit.model";
import { DepositQueryDto, CreateDepositDto, AdminCreateDepositDto, UpdateDepositStatusDto } from "@/lib/dto/deposit.dto";

export interface DepositService {
    // USER
    create(userId: string, dto: CreateDepositDto): Promise<IDepositPopulated>;
    listMine(
        userId: string,
        query: DepositQueryDto
    ): Promise<{ items: IDepositPopulated[]; total: number; page: number; limit: number }>;
    getMineById(userId: string, id: string): Promise<IDepositPopulated>;

    // ADMIN
    adminCreate(adminId: string, dto: AdminCreateDepositDto): Promise<IDepositPopulated>;
    adminList(
        query: DepositQueryDto
    ): Promise<{ items: IDepositPopulated[]; total: number; page: number; limit: number }>;
    adminGetById(id: string): Promise<IDepositPopulated>;
    adminUpdateStatus(adminId: string, id: string, dto: UpdateDepositStatusDto): Promise<IDepositPopulated>;
    adminDelete(adminId: string, id: string): Promise<void>;
}