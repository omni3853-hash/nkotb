import { AdminReviewApplicationDto, ApplicationQueryDto, CreateAssistanceApplicationDto } from "../dto/remember-betty.dto";
import { IAssistanceApplication } from "../models/application.model";

type Paginated<T> = { items: T[]; total: number; page: number; limit: number };

export interface AssistanceApplicationService {
    create(dto: CreateAssistanceApplicationDto): Promise<IAssistanceApplication>;
    list(query: ApplicationQueryDto): Promise<Paginated<IAssistanceApplication>>;
    getById(id: string): Promise<IAssistanceApplication>;
    adminReview(adminId: string, id: string, dto: AdminReviewApplicationDto): Promise<IAssistanceApplication>;
}