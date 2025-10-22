import Joi from 'joi';
export class CreateDepositDto {
    method!: string; amount!: number; reference?: string; proofUrl?: string;
    static validationSchema = Joi.object({
        method: Joi.string().required(),
        amount: Joi.number().positive().required(),
        reference: Joi.string().allow('', null),
        proofUrl: Joi.string().uri().allow('', null),
    });
    constructor(d: CreateDepositDto) { Object.assign(this, d); }
}
export class ConfirmDepositOtpDto {
    depositId!: string; otp!: string;
    static validationSchema = Joi.object({
        depositId: Joi.string().required(),
        otp: Joi.string().length(6).required(),
    });
    constructor(d: ConfirmDepositOtpDto) { Object.assign(this, d); }
}
