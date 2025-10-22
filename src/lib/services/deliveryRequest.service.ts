import { IDeliveryRequest } from "@/lib/models/deliveryRequest.model";
import { CreateDeliveryRequestDto, DeliveryRequestQueryDto, AdminUpdateDeliveryRequestStatusDto } from "@/lib/dto/deliveryRequest.dto";

export interface DeliveryRequestService {
    // user
    create(userId: string, dto: CreateDeliveryRequestDto): Promise<IDeliveryRequest>;
    myList(userId: string, query: DeliveryRequestQueryDto): Promise<{ items: IDeliveryRequest[]; total: number; page: number; limit: number }>;
    myGetById(userId: string, id: string): Promise<IDeliveryRequest>;

    // admin
    adminList(query: DeliveryRequestQueryDto & { userId?: string }): Promise<{ items: IDeliveryRequest[]; total: number; page: number; limit: number }>;
    adminGetById(id: string): Promise<IDeliveryRequest>;
    adminUpdateStatus(adminId: string, id: string, dto: AdminUpdateDeliveryRequestStatusDto): Promise<IDeliveryRequest>;
}
