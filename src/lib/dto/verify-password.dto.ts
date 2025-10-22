import Joi from 'joi';

export class VerifyPasswordDto {
    password!: string;

    static validationSchema = Joi.object({
        password: Joi.string().required(),
    });

    constructor(data: VerifyPasswordDto) { Object.assign(this, data); }
}
