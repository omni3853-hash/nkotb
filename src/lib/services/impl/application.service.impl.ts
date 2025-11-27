import { AssistanceApplication, IAssistanceApplication } from "@/lib/models/application.model";
import { AssistanceApplicationService } from "../application.service";
import EmailServiceImpl from "./email.service.impl";
import { AdminReviewApplicationDto, ApplicationQueryDto, CreateAssistanceApplicationDto } from "@/lib/dto/remember-betty.dto";
import { CustomError } from "@/lib/utils/customError.utils";
import mongoose from "mongoose";
import { logAudit } from "@/lib/utils/auditLogger";

export class AssistanceApplicationServiceImpl implements AssistanceApplicationService {
    private email = new EmailServiceImpl();

    async create(dto: CreateAssistanceApplicationDto): Promise<IAssistanceApplication> {
        const submissionMonth = new Date().toISOString().slice(0, 7);
        const dayOfMonth = new Date().getDate();

        // Applications only accepted 1st-7th of month
        if (dayOfMonth < 1 || dayOfMonth > 7) {
            throw new CustomError(
                400,
                "Applications are only accepted from the 1st to 7th of each month"
            );
        }

        const session = await mongoose.startSession();
        try {
            return await session.withTransaction(async () => {
                const application = new AssistanceApplication({
                    applicantName: dto.applicantName,
                    applicantEmail: dto.applicantEmail,
                    applicantPhone: dto.applicantPhone,
                    mailingAddress: dto.mailingAddress,
                    birthDate: new Date(dto.birthDate),
                    ssnLast4: dto.ssnLast4,
                    diagnosisDate: new Date(dto.diagnosisDate),
                    diagnosisDescription: dto.diagnosisDescription,
                    monthlyIncome: dto.monthlyIncome,
                    isEmployed: dto.isEmployed,
                    inActiveTreatment: dto.inActiveTreatment,
                    socialWorkerName: dto.socialWorkerName,
                    socialWorkerFacility: dto.socialWorkerFacility,
                    documents: {
                        applicationPdf: dto.applicationPdfUrl,
                        diagnosisLetter: dto.diagnosisLetterUrl,
                        personalStatement: dto.personalStatementUrl,
                    },
                    submissionMonth,
                });

                await application.save({ session });

                await this.email.sendApplicationConfirmation?.(
                    dto.applicantEmail,
                    dto.applicantName,
                    submissionMonth
                );

                return application;
            });
        } finally {
            await session.endSession();
        }
    }

    async list(query: ApplicationQueryDto) {
        const { status, submissionMonth, page = 1, limit = 10 } = query;
        const filter: any = {};
        if (status) filter.status = status;
        if (submissionMonth) filter.submissionMonth = submissionMonth;

        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            AssistanceApplication.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            AssistanceApplication.countDocuments(filter),
        ]);

        return { items, total, page, limit };
    }

    async getById(id: string): Promise<IAssistanceApplication> {
        const doc = await AssistanceApplication.findById(id);
        if (!doc) throw new CustomError(404, "Application not found");
        return doc;
    }

    async adminReview(
        adminId: string,
        id: string,
        dto: AdminReviewApplicationDto
    ): Promise<IAssistanceApplication> {
        const doc = await AssistanceApplication.findById(id);
        if (!doc) throw new CustomError(404, "Application not found");

        const prev = doc.status;
        doc.status = dto.status;
        doc.grantAmount = dto.grantAmount;
        doc.reviewNotes = dto.reviewNotes;
        doc.reviewedBy = new mongoose.Types.ObjectId(adminId);
        doc.reviewedAt = new Date();
        await doc.save();

        await logAudit({
            user: adminId,
            action: "UPDATE",
            resource: "ASSISTANCE_APPLICATION.",
            resourceId: id,
            description: `Application ${prev} -> ${dto.status}${dto.grantAmount ? `, grant: $${dto.grantAmount}` : ""}`,
        });

        await this.email.sendApplicationStatusUpdate?.(
            doc.applicantEmail,
            doc.applicantName,
            dto.status,
            dto.grantAmount
        );

        return doc;
    }
}