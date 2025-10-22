import Joi from "joi";

export class UpdatePlatformDto {
    siteName?: string;
    siteTagline?: string;
    siteDescription?: string;
    supportEmail?: string;
    supportPhone?: string;
    minDepositAmount?: number;
    bookingFeePercentage?: number;
    cancellationPolicy?: string;
    refundPolicy?: string;

    static validationSchema = Joi.object({
        siteName: Joi.string(),
        siteTagline: Joi.string(),
        siteDescription: Joi.string().allow(""),
        supportEmail: Joi.string().email(),
        supportPhone: Joi.string(),
        minDepositAmount: Joi.number().min(0),
        bookingFeePercentage: Joi.number().min(0),
        cancellationPolicy: Joi.string().allow(""),
        refundPolicy: Joi.string().allow(""),
    });

    constructor(data: UpdatePlatformDto) {
        Object.assign(this, data);
    }
}
