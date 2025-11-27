import Joi from "joi";
import {
    DonationStatus,
    DonationFrequency,
    ApplicationStatus,
    VolunteerStatus,
} from "@/lib/enums/remember-betty.enums";

// ============================================================================
// DONATION DTOs
// ============================================================================

export class CreateDonationDto {
    donorName!: string;
    donorEmail!: string;
    donorPhone?: string;
    amount!: number;
    frequency!: DonationFrequency;
    dedicatedTo?: string;
    isAnonymous!: boolean;
    paymentMethodId?: string;
    proofOfPayment?: string;
    notes?: string;

    static validationSchema = Joi.object({
        donorName: Joi.string().min(2).required(),
        donorEmail: Joi.string().email().required(),
        donorPhone: Joi.string().allow(""),
        amount: Joi.number().positive().required(),
        frequency: Joi.string()
            .valid(...Object.values(DonationFrequency))
            .default(DonationFrequency.ONE_TIME),
        dedicatedTo: Joi.string().allow(""),
        isAnonymous: Joi.boolean().default(false),
        paymentMethodId: Joi.string().allow(""),
        proofOfPayment: Joi.string().allow(""),
        notes: Joi.string().allow(""),
    });

    constructor(data: Partial<CreateDonationDto>) {
        Object.assign(this, data);
    }
}

export class DonationQueryDto {
    status?: DonationStatus;
    donorEmail?: string;
    page?: number;
    limit?: number;

    static validationSchema = Joi.object({
        status: Joi.string()
            .valid(...Object.values(DonationStatus))
            .optional(),
        donorEmail: Joi.string().email().optional(),
        page: Joi.number().min(1).default(1),
        limit: Joi.number().min(1).max(100).default(10),
    });

    constructor(data: Partial<DonationQueryDto>) {
        Object.assign(this, data);
    }
}

export class AdminUpdateDonationStatusDto {
    status!: DonationStatus;
    notes?: string;

    static validationSchema = Joi.object({
        status: Joi.string()
            .valid(...Object.values(DonationStatus))
            .required(),
        notes: Joi.string().allow(""),
    });

    constructor(data: Partial<AdminUpdateDonationStatusDto>) {
        Object.assign(this, data);
    }
}

// ============================================================================
// ASSISTANCE APPLICATION DTOs
// ============================================================================

export class CreateAssistanceApplicationDto {
    applicantName!: string;
    applicantEmail!: string;
    applicantPhone?: string;
    mailingAddress!: string;
    birthDate!: string;
    ssnLast4!: string;
    diagnosisDate!: string;
    diagnosisDescription!: string;
    monthlyIncome!: number;
    isEmployed!: boolean;
    inActiveTreatment!: boolean;
    socialWorkerName?: string;
    socialWorkerFacility?: string;
    applicationPdfUrl!: string;
    diagnosisLetterUrl!: string;
    personalStatementUrl?: string;

    static validationSchema = Joi.object({
        applicantName: Joi.string().min(2).required(),
        applicantEmail: Joi.string().email().required(),
        applicantPhone: Joi.string().allow(""),
        mailingAddress: Joi.string().min(10).required(),
        birthDate: Joi.date().iso().required(),
        ssnLast4: Joi.string().length(4).pattern(/^\d{4}$/).required(),
        diagnosisDate: Joi.date().iso().required(),
        diagnosisDescription: Joi.string().min(10).required(),
        monthlyIncome: Joi.number().min(0).required(),
        isEmployed: Joi.boolean().default(false),
        inActiveTreatment: Joi.boolean().default(false),
        socialWorkerName: Joi.string().allow(""),
        socialWorkerFacility: Joi.string().allow(""),
        applicationPdfUrl: Joi.string().uri().required(),
        diagnosisLetterUrl: Joi.string().uri().required(),
        personalStatementUrl: Joi.string().uri().allow(""),
    });

    constructor(data: Partial<CreateAssistanceApplicationDto>) {
        Object.assign(this, data);
    }
}

export class ApplicationQueryDto {
    status?: ApplicationStatus;
    submissionMonth?: string;
    page?: number;
    limit?: number;

    static validationSchema = Joi.object({
        status: Joi.string()
            .valid(...Object.values(ApplicationStatus))
            .optional(),
        submissionMonth: Joi.string().pattern(/^\d{4}-\d{2}$/).optional(),
        page: Joi.number().min(1).default(1),
        limit: Joi.number().min(1).max(100).default(10),
    });

    constructor(data: Partial<ApplicationQueryDto>) {
        Object.assign(this, data);
    }
}

export class AdminReviewApplicationDto {
    status!: ApplicationStatus;
    grantAmount?: number;
    reviewNotes?: string;

    static validationSchema = Joi.object({
        status: Joi.string()
            .valid(...Object.values(ApplicationStatus))
            .required(),
        grantAmount: Joi.number().min(500).max(1000).optional(),
        reviewNotes: Joi.string().allow(""),
    });

    constructor(data: Partial<AdminReviewApplicationDto>) {
        Object.assign(this, data);
    }
}

// ============================================================================
// VOLUNTEER DTOs
// ============================================================================

export class CreateVolunteerDto {
    fullName!: string;
    email!: string;
    phone?: string;
    interests!: string[];
    availability?: string;
    notes?: string;

    static validationSchema = Joi.object({
        fullName: Joi.string().min(2).required(),
        email: Joi.string().email().required(),
        phone: Joi.string().allow(""),
        interests: Joi.array().items(Joi.string()).min(1).required(),
        availability: Joi.string().allow(""),
        notes: Joi.string().allow(""),
    });

    constructor(data: Partial<CreateVolunteerDto>) {
        Object.assign(this, data);
    }
}

export class VolunteerQueryDto {
    status?: VolunteerStatus;
    page?: number;
    limit?: number;

    static validationSchema = Joi.object({
        status: Joi.string()
            .valid(...Object.values(VolunteerStatus))
            .optional(),
        page: Joi.number().min(1).default(1),
        limit: Joi.number().min(1).max(100).default(10),
    });

    constructor(data: Partial<VolunteerQueryDto>) {
        Object.assign(this, data);
    }
}

export class AdminUpdateVolunteerStatusDto {
    status!: VolunteerStatus;
    notes?: string;

    static validationSchema = Joi.object({
        status: Joi.string()
            .valid(...Object.values(VolunteerStatus))
            .required(),
        notes: Joi.string().allow(""),
    });

    constructor(data: Partial<AdminUpdateVolunteerStatusDto>) {
        Object.assign(this, data);
    }
}