import { AdminUpdateDonationStatusDto, CreateDonationDto, DonationQueryDto } from "@/lib/dto/remember-betty.dto";
import EmailServiceImpl from "./email.service.impl";
import { DonationService } from "../donation.service";
import { Donation, IDonation } from "@/lib/models/donation.model";
import mongoose from "mongoose";
import { logAudit } from "@/lib/utils/auditLogger";
import { CustomError } from "@/lib/utils/customError.utils";

export class DonationServiceImpl implements DonationService {
    private email = new EmailServiceImpl();

    async create(dto: CreateDonationDto): Promise<IDonation> {
        const session = await mongoose.startSession();
        try {
            return await session.withTransaction(async () => {
                const donation = new Donation({
                    donorName: dto.donorName,
                    donorEmail: dto.donorEmail,
                    donorPhone: dto.donorPhone,
                    amount: dto.amount,
                    frequency: dto.frequency,
                    dedicatedTo: dto.dedicatedTo,
                    isAnonymous: dto.isAnonymous,
                    payment: {
                        paymentMethod: dto.paymentMethodId
                            ? new mongoose.Types.ObjectId(dto.paymentMethodId)
                            : undefined,
                        amount: dto.amount,
                        proofOfPayment: dto.proofOfPayment,
                    },
                    notes: dto.notes,
                });

                await donation.save({ session });

                await this.email.sendDonationConfirmation?.(
                    dto.donorEmail,
                    dto.donorName,
                    dto.amount,
                    dto.frequency
                );

                return donation;
            });
        } finally {
            await session.endSession();
        }
    }

    async list(query: DonationQueryDto) {
        const { status, donorEmail, page = 1, limit = 10 } = query;
        const filter: any = {};
        if (status) filter.status = status;
        if (donorEmail) filter.donorEmail = donorEmail;

        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            Donation.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Donation.countDocuments(filter),
        ]);

        return { items, total, page, limit };
    }

    async getById(id: string): Promise<IDonation> {
        const doc = await Donation.findById(id);
        if (!doc) throw new CustomError(404, "Donation not found");
        return doc;
    }

    async adminUpdateStatus(
        adminId: string,
        id: string,
        dto: AdminUpdateDonationStatusDto
    ): Promise<IDonation> {
        const doc = await Donation.findById(id);
        if (!doc) throw new CustomError(404, "Donation not found");

        const prev = doc.status;
        doc.status = dto.status;
        if (dto.notes) doc.notes = dto.notes;
        await doc.save();

        await logAudit({
            user: adminId,
            action: "UPDATE",
            resource: "DONATION",
            resourceId: id,
            description: `Donation status ${prev} -> ${dto.status}`,
        });

        return doc;
    }
}