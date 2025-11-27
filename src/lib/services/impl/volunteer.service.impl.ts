import { IVolunteer, Volunteer } from "@/lib/models/volunteer.model";
import { VolunteerService } from "../volunteer.service";
import EmailServiceImpl from "./email.service.impl";
import { AdminUpdateVolunteerStatusDto, CreateVolunteerDto, VolunteerQueryDto } from "@/lib/dto/remember-betty.dto";
import { logAudit } from "@/lib/utils/auditLogger";
import { CustomError } from "@/lib/utils/customError.utils";

export class VolunteerServiceImpl implements VolunteerService {
    private email = new EmailServiceImpl();

    async create(dto: CreateVolunteerDto): Promise<IVolunteer> {
        const volunteer = new Volunteer({
            fullName: dto.fullName,
            email: dto.email,
            phone: dto.phone,
            interests: dto.interests,
            availability: dto.availability,
            notes: dto.notes,
        });

        await volunteer.save();

        await this.email.sendVolunteerConfirmation?.(dto.email, dto.fullName);

        return volunteer;
    }

    async list(query: VolunteerQueryDto) {
        const { status, page = 1, limit = 10 } = query;
        const filter: any = {};
        if (status) filter.status = status;

        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            Volunteer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Volunteer.countDocuments(filter),
        ]);

        return { items, total, page, limit };
    }

    async getById(id: string): Promise<IVolunteer> {
        const doc = await Volunteer.findById(id);
        if (!doc) throw new CustomError(404, "Volunteer not found");
        return doc;
    }

    async adminUpdateStatus(
        adminId: string,
        id: string,
        dto: AdminUpdateVolunteerStatusDto
    ): Promise<IVolunteer> {
        const doc = await Volunteer.findById(id);
        if (!doc) throw new CustomError(404, "Volunteer not found");

        const prev = doc.status;
        doc.status = dto.status;
        if (dto.notes) doc.notes = dto.notes;
        await doc.save();

        await logAudit({
            user: adminId,
            action: "UPDATE",
            resource: "VOLUNTEER",
            resourceId: id,
            description: `Volunteer status ${prev} -> ${dto.status}`,
        });

        return doc;
    }
}