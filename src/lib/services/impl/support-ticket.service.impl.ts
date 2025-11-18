import mongoose from "mongoose";
import { SupportTicketService } from "@/lib/services/support-ticket.service";
import {
    ISupportTicket,
    SupportTicket,
} from "@/lib/models/support-ticket.model";
import {
    CreateSupportTicketDto,
    SupportTicketQueryDto,
    AdminReplySupportTicketDto,
    AdminUpdateSupportStatusDto,
} from "@/lib/dto/support-ticket.dto";
import { SupportStatus } from "@/lib/enums/support.enums";
import { User } from "@/lib/models/user.model";
import { CustomError } from "@/lib/utils/customError.utils";
import { logAudit } from "@/lib/utils/auditLogger";
import EmailServiceImpl from "@/lib/services/impl/email.service.impl";

export default class SupportTicketServiceImpl implements SupportTicketService {
    private email = new EmailServiceImpl();

    async createPublic(
        dto: CreateSupportTicketDto,
        userId?: string | null
    ): Promise<ISupportTicket> {
        const session = await mongoose.startSession();
        try {
            return await session.withTransaction(
                async () => {
                    let user = null;
                    if (userId) {
                        user = await User.findById(userId).session(session);
                    }

                    const ticket = await SupportTicket.create(
                        [
                            {
                                user: user?._id ?? null,
                                isGuest: !user,
                                contact: {
                                    name: dto.fullName,
                                    email: dto.email,
                                    phone: dto.phone,
                                },
                                subject: dto.subject,
                                message: dto.message,
                                status: SupportStatus.OPEN,
                                priority: dto.priority,
                            },
                        ],
                        { session }
                    );

                    const created = ticket[0];

                    // email user acknowledgement
                    await this.email.sendSupportTicketReceived?.({
                        email: dto.email,
                        fullName: dto.fullName,
                        subject: dto.subject,
                        message: dto.message,
                        ticketId: created._id.toString(),
                    });

                    // email internal recipients (admins)
                    await this.email.sendSupportTicketNotificationToAdmin?.({
                        subject: dto.subject,
                        fromEmail: dto.email,
                        fromName: dto.fullName,
                        message: dto.message,
                        ticketId: created._id.toString(),
                    });

                    return created;
                },
                { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } }
            );
        } finally {
            await session.endSession();
        }
    }

    async adminList(
        query: SupportTicketQueryDto & { userId?: string }
    ): Promise<{ items: ISupportTicket[]; total: number; page: number; limit: number }> {
        const { status, priority, email, page = 1, limit = 10, userId } = query;
        const filter: any = {};
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (email) filter["contact.email"] = email.toLowerCase();
        if (userId) filter.user = userId;

        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            SupportTicket.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("user", "firstName lastName email")
                .populate("assignedTo", "firstName lastName email")
                .lean<ISupportTicket[]>(),
            SupportTicket.countDocuments(filter),
        ]);

        return { items, total, page, limit };
    }

    async adminGetById(id: string): Promise<ISupportTicket> {
        const ticket = await SupportTicket.findById(id)
            .populate("user", "firstName lastName email")
            .populate("assignedTo", "firstName lastName email")
            .lean<ISupportTicket>();
        if (!ticket) throw new CustomError(404, "Support ticket not found");
        return ticket;
    }

    async adminReply(
        adminId: string,
        ticketId: string,
        dto: AdminReplySupportTicketDto
    ): Promise<ISupportTicket> {
        const session = await mongoose.startSession();
        try {
            const result = await session.withTransaction(async () => {
                const ticket = await SupportTicket.findById(ticketId).session(session);
                if (!ticket) throw new CustomError(404, "Support ticket not found");

                const reply = {
                    from: "ADMIN" as const,
                    body: dto.body,
                    authorUser: new mongoose.Types.ObjectId(adminId),
                    createdAt: new Date(),
                };

                ticket.replies.push(reply as any);
                ticket.lastRepliedAt = new Date();
                ticket.lastRepliedBy = new mongoose.Types.ObjectId(adminId);
                if (ticket.status === SupportStatus.OPEN) {
                    ticket.status = SupportStatus.IN_PROGRESS;
                }

                await ticket.save({ session });

                await logAudit({
                    user: adminId,
                    action: "UPDATE",
                    resource: "SUPPORT_TICKET",
                    resourceId: ticket._id.toString(),
                    description: `Admin replied to support ticket`,
                });

                // Send reply via email to customer
                await this.email.sendSupportTicketReply?.({
                    email: ticket.contact.email,
                    fullName: ticket.contact.name,
                    subject: ticket.subject,
                    ticketId: ticket._id.toString(),
                    replyBody: dto.body,
                });

                const populated = await SupportTicket.findById(ticket._id)
                    .populate("user", "firstName lastName email")
                    .populate("assignedTo", "firstName lastName email")
                    .lean<ISupportTicket>()
                    .session(session);

                if (!populated) throw new CustomError(500, "Failed to load support ticket");
                return populated;
            });

            return result!;
        } finally {
            await session.endSession();
        }
    }

    async adminUpdateStatus(
        adminId: string,
        ticketId: string,
        dto: AdminUpdateSupportStatusDto
    ): Promise<ISupportTicket> {
        const ticket = await SupportTicket.findById(ticketId);
        if (!ticket) throw new CustomError(404, "Support ticket not found");

        ticket.status = dto.status;
        await ticket.save();

        await logAudit({
            user: adminId,
            action: "UPDATE",
            resource: "SUPPORT_TICKET",
            resourceId: ticket._id.toString(),
            description: `Support ticket status updated to ${dto.status}`,
        });

        const populated = await SupportTicket.findById(ticket._id)
            .populate("user", "firstName lastName email")
            .populate("assignedTo", "firstName lastName email")
            .lean<ISupportTicket>();

        if (!populated) throw new CustomError(500, "Failed to load support ticket");
        return populated;
    }
}
