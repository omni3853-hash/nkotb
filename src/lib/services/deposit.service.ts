import type { IDeposit } from "@/lib/models/deposit.model";
import { DepositQueryDto, CreateDepositDto, AdminCreateDepositDto, UpdateDepositStatusDto } from "@/lib/dto/deposit.dto";

export interface DepositService {
    // USER
    create(userId: string, dto: CreateDepositDto): Promise<IDeposit>;
    listMine(userId: string, query: DepositQueryDto): Promise<{ items: IDeposit[]; total: number; page: number; limit: number }>;
    getMineById(userId: string, id: string): Promise<IDeposit>;

    // ADMIN
    adminCreate(adminId: string, dto: AdminCreateDepositDto): Promise<IDeposit>;
    adminList(query: DepositQueryDto): Promise<{ items: IDeposit[]; total: number; page: number; limit: number }>;
    adminGetById(id: string): Promise<IDeposit>;
    adminUpdateStatus(adminId: string, id: string, dto: UpdateDepositStatusDto): Promise<IDeposit>;
    adminDelete(adminId: string, id: string): Promise<void>;
}
