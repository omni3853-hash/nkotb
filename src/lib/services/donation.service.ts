import { AdminUpdateDonationStatusDto, CreateDonationDto, DonationQueryDto } from "../dto/remember-betty.dto";
import { IDonation } from "../models/donation.model";

type Paginated<T> = { items: T[]; total: number; page: number; limit: number };

export interface DonationService {
    create(dto: CreateDonationDto): Promise<IDonation>;
    list(query: DonationQueryDto): Promise<Paginated<IDonation>>;
    getById(id: string): Promise<IDonation>;
    adminUpdateStatus(adminId: string, id: string, dto: AdminUpdateDonationStatusDto): Promise<IDonation>;
}