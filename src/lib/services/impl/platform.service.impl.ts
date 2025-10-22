import mongoose from "mongoose";
import { PlatformService } from "../platform.service";
import { IPlatform, Platform } from "@/lib/models/platform.model";
import { UpdatePlatformDto } from "@/lib/dto/platform.dto";
import { CustomError } from "@/lib/utils/customError.utils";
import { logAudit } from "@/lib/utils/auditLogger";
import NotificationServiceImpl from "@/lib/services/impl/notification.service.impl";
import EmailServiceImpl from "@/lib/services/impl/email.service.impl";
import { CreateNotificationDto } from "@/lib/dto/notification.dto";

const notif = new NotificationServiceImpl();
const email = new EmailServiceImpl();

export default class PlatformServiceImpl implements PlatformService {
    async get(): Promise<IPlatform> {
        let doc = await Platform.findOne();
        if (!doc) doc = await Platform.create({});
        return doc;
    }

    async update(adminId: string, dto: UpdatePlatformDto): Promise<IPlatform> {
        const { error } = UpdatePlatformDto.validationSchema.validate(dto);
        if (error) throw new CustomError(400, error.message);

        const session = await mongoose.startSession();
        try {
            return await session.withTransaction(async () => {
                let doc = await Platform.findOne().session(session);
                if (!doc) doc = new Platform({});
                Object.assign(doc, dto);
                await doc.save({ session });

                await logAudit({
                    user: adminId,
                    action: "UPDATE",
                    resource: "PLATFORM",
                    resourceId: doc._id as string,
                    description: "Platform settings updated",
                });

                await notif.create(new CreateNotificationDto({
                    user: adminId,
                    type: "PLATFORM",
                    title: "Platform updated",
                    message: "Platform settings successfully updated.",
                }));

                // optional: email a digest to the acting admin (or to a configured ops address)
                if (process.env.PLATFORM_UPDATE_DIGEST_TO) {
                    await email.sendPlatformUpdatedDigestToAdmin?.(process.env.PLATFORM_UPDATE_DIGEST_TO);
                }

                return doc;
            });
        } finally {
            await session.endSession();
        }
    }
}
