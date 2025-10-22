import { Audit } from '@/lib/models/audit.model';

export async function logAudit(params: {
    user: string;
    action: string;
    resource: string;
    resourceId?: string;
    description: string;
}) {
    try {
        await new Audit({
            user: params.user,
            action: params.action,
            resource: params.resource,
            resourceId: params.resourceId,
            description: params.description,
        }).save();
    } catch (e) {
        console.error('audit log failed:', e);
    }
}
