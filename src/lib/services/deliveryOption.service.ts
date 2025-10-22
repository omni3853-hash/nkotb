import { IDeliveryOption } from "@/lib/models/deliveryOption.model";
import { CreateDeliveryOptionDto, DeliveryOptionQueryDto, UpdateDeliveryOptionDto } from "@/lib/dto/deliveryOption.dto";

export interface DeliveryOptionService {
    create(adminId: string, dto: CreateDeliveryOptionDto): Promise<IDeliveryOption>;
    update(adminId: string, id: string, dto: UpdateDeliveryOptionDto): Promise<IDeliveryOption>;
    delete(adminId: string, id: string): Promise<void>;
    toggleActive(adminId: string, id: string, isActive: boolean): Promise<IDeliveryOption>;
    getById(id: string): Promise<IDeliveryOption>;
    list(query: DeliveryOptionQueryDto): Promise<{ items: IDeliveryOption[]; total: number; page: number; limit: number }>;
}
