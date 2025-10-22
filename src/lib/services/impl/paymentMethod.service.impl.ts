import { PaymentMethodService } from '../paymentMethod.service';
import {
    CreatePaymentMethodDto,
    PaymentMethodQueryDto,
    UpdatePaymentMethodDto,
} from '@/lib/dto/paymentMethod.dto';
import { CustomError } from '@/lib/utils/customError.utils';
import { AccountType } from '@/lib/enums/account.enum';
import { logAudit } from '@/lib/utils/auditLogger';
import NotificationServiceImpl from '@/lib/services/impl/notification.service.impl';
import { CreateNotificationDto } from '@/lib/dto/notification.dto';
import { IPaymentMethod, PaymentMethod } from '@/lib/models/payment-method.model';

// --- small typed helper to omit keys ---
function omitKeys<T extends Record<string, any>, K extends readonly (keyof T)[]>(
    obj: T,
    keys: K,
): Omit<T, K[number]> {
    const clone: any = { ...obj };
    for (const k of keys) delete clone[k as string];
    return clone;
}

// Fields actually needed for validation, excluding `user`
type ValidatableFields = Omit<
    CreatePaymentMethodDto,
    'user'
>;

class PaymentMethodServiceImpl implements PaymentMethodService {
    private notif = new NotificationServiceImpl();

    private validateFieldsByType(data: Partial<ValidatableFields>) {
        switch (data.type) {
            case AccountType.CRYPTO_WALLET:
                if (!data.walletAddress) {
                    throw new CustomError(400, 'walletAddress is required for CRYPTO_WALLET');
                }
                break;
            case AccountType.BANK_ACCOUNT:
                if (!data.bankName || !data.accountName || !data.accountNumber) {
                    throw new CustomError(
                        400,
                        'bankName, accountName and accountNumber are required for BANK_ACCOUNT',
                    );
                }
                break;
            case AccountType.MOBILE_PAYMENT:
                if (!data.provider || !data.handle) {
                    throw new CustomError(400, 'provider and handle are required for MOBILE_PAYMENT');
                }
                break;
            default:
                // allow partial updates when type is not being changed
                break;
        }
    }

    async create(adminId: string, data: CreatePaymentMethodDto): Promise<IPaymentMethod> {
        this.validateFieldsByType(data);

        const pm = new PaymentMethod({
            ...data,
            user: adminId,
        });
        await pm.save();

        if (pm.isDefault) {
            await PaymentMethod.updateMany(
                { _id: { $ne: pm._id }, type: pm.type },
                { $set: { isDefault: false } },
            );
        }

        await logAudit({
            user: adminId,
            action: 'CREATE',
            resource: 'PAYMENT_METHOD',
            resourceId: pm._id.toString(),
            description: `Created payment method [${pm.type}]`,
        });

        await this.notif.create(
            new CreateNotificationDto({
                user: adminId,
                type: 'PAYMENT_METHOD',
                title: 'Payment method created',
                message: `Payment method [${pm.type}] has been created.`,
            }),
        );

        return pm;
    }

    async update(adminId: string, id: string, data: UpdatePaymentMethodDto): Promise<IPaymentMethod> {
        const pm = await PaymentMethod.findById(id);
        if (!pm) throw new CustomError(404, 'Payment method not found');

        // strip non-validatable keys & mongoose meta BEFORE typing
        const current = omitKeys(pm.toObject(), [
            'user', '_id', '__v', 'createdAt', 'updatedAt',
        ]) as Partial<ValidatableFields>;

        const merged: Partial<ValidatableFields> = { ...current, ...data };
        this.validateFieldsByType(merged);

        Object.assign(pm, data);
        await pm.save();

        if (data.isDefault === true) {
            await PaymentMethod.updateMany(
                { _id: { $ne: pm._id }, type: pm.type },
                { $set: { isDefault: false } },
            );
        }

        await logAudit({
            user: adminId,
            action: 'UPDATE',
            resource: 'PAYMENT_METHOD',
            resourceId: pm._id.toString(),
            description: `Updated payment method [${pm.type}]`,
        });

        await this.notif.create(
            new CreateNotificationDto({
                user: adminId,
                type: 'PAYMENT_METHOD',
                title: 'Payment method updated',
                message: `Payment method [${pm.type}] has been updated.`,
            }),
        );

        return pm;
    }

    async delete(adminId: string, id: string): Promise<void> {
        const pm = await PaymentMethod.findById(id);
        if (!pm) throw new CustomError(404, 'Payment method not found');

        await PaymentMethod.findByIdAndDelete(id);

        await logAudit({
            user: adminId,
            action: 'DELETE',
            resource: 'PAYMENT_METHOD',
            resourceId: id,
            description: `Deleted payment method [${pm.type}]`,
        });

        await this.notif.create(
            new CreateNotificationDto({
                user: adminId,
                type: 'PAYMENT_METHOD',
                title: 'Payment method deleted',
                message: `Payment method [${pm.type}] has been deleted.`,
            }),
        );
    }

    async adminGetById(id: string): Promise<IPaymentMethod> {
        const pm = await PaymentMethod.findById(id);
        if (!pm) throw new CustomError(404, 'Payment method not found');
        return pm;
    }

    async adminList(query: PaymentMethodQueryDto) {
        const { type, status, page = 1, limit = 10 } = query;
        const filter: Record<string, unknown> = {};
        if (type) filter.type = type;
        if (typeof status === 'boolean') filter.status = status;

        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            PaymentMethod.find(filter).sort({ isDefault: -1, createdAt: -1 }).skip(skip).limit(limit),
            PaymentMethod.countDocuments(filter),
        ]);

        return { items, total, page, limit };
    }

    async userListActive(query: PaymentMethodQueryDto) {
        const { type, page = 1, limit = 10 } = query;
        const filter: Record<string, unknown> = { status: true };
        if (type) filter.type = type;

        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            PaymentMethod.find(filter).sort({ isDefault: -1, createdAt: -1 }).skip(skip).limit(limit),
            PaymentMethod.countDocuments(filter),
        ]);

        return { items, total, page, limit };
    }

    async toggleStatus(adminId: string, id: string, status: boolean): Promise<IPaymentMethod> {
        const pm = await PaymentMethod.findById(id);
        if (!pm) throw new CustomError(404, 'Payment method not found');

        pm.status = status;
        await pm.save();

        await logAudit({
            user: adminId,
            action: 'UPDATE',
            resource: 'PAYMENT_METHOD',
            resourceId: id,
            description: `Toggled status to ${status}`,
        });

        await this.notif.create(
            new CreateNotificationDto({
                user: adminId,
                type: 'PAYMENT_METHOD',
                title: 'Payment method status changed',
                message: `Payment method [${pm.type}] is now ${status ? 'ACTIVE' : 'INACTIVE'}.`,
            }),
        );

        return pm;
    }

    async setDefault(adminId: string, id: string): Promise<IPaymentMethod> {
        const pm = await PaymentMethod.findById(id);
        if (!pm) throw new CustomError(404, 'Payment method not found');

        pm.isDefault = true;
        await pm.save();
        await PaymentMethod.updateMany(
            { _id: { $ne: id }, type: pm.type },
            { $set: { isDefault: false } },
        );

        await logAudit({
            user: adminId,
            action: 'UPDATE',
            resource: 'PAYMENT_METHOD',
            resourceId: id,
            description: `Set default for type ${pm.type}`,
        });

        await this.notif.create(
            new CreateNotificationDto({
                user: adminId,
                type: 'PAYMENT_METHOD',
                title: 'Default payment method set',
                message: `Default method for type ${pm.type} updated.`,
            }),
        );

        return pm;
    }
}

export default PaymentMethodServiceImpl;
