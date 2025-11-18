import type { ISupportTicket } from "@/lib/models/support-ticket.model";
import {
    CreateSupportTicketDto,
    SupportTicketQueryDto,
    AdminReplySupportTicketDto,
    AdminUpdateSupportStatusDto,
} from "@/lib/dto/support-ticket.dto";

export interface SupportTicketService {
    createPublic(dto: CreateSupportTicketDto, userId?: string | null): Promise<ISupportTicket>;

    adminList(
        query: SupportTicketQueryDto & { userId?: string }
    ): Promise<{ items: ISupportTicket[]; total: number; page: number; limit: number }>;

    adminGetById(id: string): Promise<ISupportTicket>;

    adminReply(
        adminId: string,
        ticketId: string,
        dto: AdminReplySupportTicketDto
    ): Promise<ISupportTicket>;

    adminUpdateStatus(
        adminId: string,
        ticketId: string,
        dto: AdminUpdateSupportStatusDto
    ): Promise<ISupportTicket>;
}
