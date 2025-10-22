import { IPlatform } from "@/lib/models/platform.model";
import { UpdatePlatformDto } from "@/lib/dto/platform.dto";

export interface PlatformService {
    get(): Promise<IPlatform>;
    update(adminId: string, dto: UpdatePlatformDto): Promise<IPlatform>;
}
