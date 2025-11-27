import { AdminUpdateVolunteerStatusDto, CreateVolunteerDto, VolunteerQueryDto } from "../dto/remember-betty.dto";
import { IVolunteer } from "../models/volunteer.model";

type Paginated<T> = { items: T[]; total: number; page: number; limit: number };

export interface VolunteerService {
    create(dto: CreateVolunteerDto): Promise<IVolunteer>;
    list(query: VolunteerQueryDto): Promise<Paginated<IVolunteer>>;
    getById(id: string): Promise<IVolunteer>;
    adminUpdateStatus(adminId: string, id: string, dto: AdminUpdateVolunteerStatusDto): Promise<IVolunteer>;
}