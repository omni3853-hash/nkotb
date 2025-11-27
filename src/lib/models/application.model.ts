import mongoose, { Schema, Model, Document, Types } from "mongoose";
import { ApplicationStatus } from "../enums/remember-betty.enums";

export interface IApplicationDocuments {
    applicationPdf: string; // URL to filled PDF
    diagnosisLetter: string; // URL to diagnosis letter
    personalStatement?: string; // URL to personal statement or text
}

export interface IAssistanceApplication extends Document {
    _id: Types.ObjectId;
    applicantName: string;
    applicantEmail: string;
    applicantPhone?: string;
    mailingAddress: string;
    birthDate: Date;
    ssnLast4: string;
    diagnosisDate: Date;
    diagnosisDescription: string;
    monthlyIncome: number;
    isEmployed: boolean;
    inActiveTreatment: boolean;
    socialWorkerName?: string;
    socialWorkerFacility?: string;
    documents: IApplicationDocuments;
    status: ApplicationStatus;
    grantAmount?: number;
    reviewNotes?: string;
    reviewedBy?: Types.ObjectId;
    reviewedAt?: Date;
    submissionMonth: string; // YYYY-MM format
    createdAt: Date;
    updatedAt: Date;
}

const ApplicationDocumentsSchema = new Schema<IApplicationDocuments>(
    {
        applicationPdf: { type: String, required: true },
        diagnosisLetter: { type: String, required: true },
        personalStatement: { type: String },
    },
    { _id: false }
);

const AssistanceApplicationSchema = new Schema<IAssistanceApplication>(
    {
        applicantName: { type: String, required: true },
        applicantEmail: { type: String, required: true },
        applicantPhone: { type: String },
        mailingAddress: { type: String, required: true },
        birthDate: { type: Date, required: true },
        ssnLast4: { type: String, required: true, length: 4 },
        diagnosisDate: { type: Date, required: true },
        diagnosisDescription: { type: String, required: true },
        monthlyIncome: { type: Number, required: true, min: 0 },
        isEmployed: { type: Boolean, default: false },
        inActiveTreatment: { type: Boolean, default: false },
        socialWorkerName: { type: String },
        socialWorkerFacility: { type: String },
        documents: { type: ApplicationDocumentsSchema, required: true },
        status: {
            type: String,
            enum: Object.values(ApplicationStatus),
            default: ApplicationStatus.SUBMITTED,
        },
        grantAmount: { type: Number, min: 500, max: 1000 },
        reviewNotes: { type: String },
        reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
        reviewedAt: { type: Date },
        submissionMonth: { type: String, required: true, index: true },
    },
    { timestamps: true }
);

AssistanceApplicationSchema.index({ applicantEmail: 1, submissionMonth: 1 });
AssistanceApplicationSchema.index({ status: 1, createdAt: -1 });

export const AssistanceApplication: Model<IAssistanceApplication> =
    mongoose.models.AssistanceApplication ||
    mongoose.model<IAssistanceApplication>("AssistanceApplication", AssistanceApplicationSchema);