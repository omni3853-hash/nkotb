import { IAudit } from '@/lib/models/audit.model';
import { CreateAuditDto, AuditQueryDto } from '@/lib/dto/audit.dto';

export interface AuditService {
  create(data: CreateAuditDto): Promise<IAudit>;
  getById(id: string): Promise<IAudit>;
  adminList(query: AuditQueryDto): Promise<{ items: IAudit[]; total: number; page: number; limit: number }>;
  userList(userId: string, query: AuditQueryDto): Promise<{ items: IAudit[]; total: number; page: number; limit: number }>;
}
