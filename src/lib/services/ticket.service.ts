import type { ITicket } from "@/lib/models/ticket.model";
import { CreateTicketDto, TicketQueryDto, AdminUpdateTicketStatusDto } from "@/lib/dto/ticket.dto";

export interface TicketService {
    // USER
    create(userId: string, dto: CreateTicketDto): Promise<ITicket>;
    myList(userId: string, query: TicketQueryDto): Promise<{ items: ITicket[]; total: number; page: number; limit: number }>;
    myGetById(userId: string, id: string): Promise<ITicket>;

    // ADMIN
    adminList(query: TicketQueryDto & { userId?: string; eventId?: string }): Promise<{ items: ITicket[]; total: number; page: number; limit: number }>;
    adminGetById(id: string): Promise<ITicket>;
    adminUpdateStatus(adminId: string, id: string, dto: AdminUpdateTicketStatusDto): Promise<ITicket>;
}
