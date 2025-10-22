import Joi from 'joi';
import { TransactionType, PaymentMethod } from '../enums/enums';

export class CreateTransactionDto {
    userId: string;
    type: TransactionType;
    amount: number;
    method: PaymentMethod;
    fee?: number;
    notes?: string;
    proofOfPayment?: string;
    paymentMethod?: string;
    password: string;
    metadata?: any;

    static validationSchema = Joi.object({
        userId: Joi.string().required(),
        type: Joi.string().valid(...Object.values(TransactionType)).required(),
        amount: Joi.number().positive().required(),
        method: Joi.string().valid(...Object.values(PaymentMethod)).required(),
        fee: Joi.number().min(0).default(0),
        notes: Joi.string().optional(),
        proofOfPayment: Joi.string().optional(),
        paymentMethod: Joi.string().optional(),
        password: Joi.string().required(),
        metadata: Joi.object().optional()
    });

    constructor(data: CreateTransactionDto) {
        this.userId = data.userId;
        this.type = data.type;
        this.amount = data.amount;
        this.method = data.method;
        this.fee = data.fee;
        this.notes = data.notes;
        this.proofOfPayment = data.proofOfPayment;
        this.paymentMethod = data.paymentMethod;
        this.password = data.password;
        this.metadata = data.metadata;
    }
}

export class VerifyTransactionDto {
    userId: string;
    transactionId: string;
    otp: string;

    static validationSchema = Joi.object({
        userId: Joi.string().required(),
        transactionId: Joi.string().required(),
        otp: Joi.string().required()
    });

    constructor(data: VerifyTransactionDto) {
        this.userId = data.userId;
        this.transactionId = data.transactionId;
        this.otp = data.otp;
    }
}

export class AdminCreateTransactionDto {
    userId: string;
    type: TransactionType;
    amount: number;
    method: PaymentMethod;
    fee?: number;
    notes?: string;
    metadata?: any;

    static validationSchema = Joi.object({
        userId: Joi.string().required(),
        type: Joi.string().valid(...Object.values(TransactionType)).required(),
        amount: Joi.number().required(),
        method: Joi.string().valid(...Object.values(PaymentMethod)).required(),
        fee: Joi.number().min(0).default(0),
        notes: Joi.string().optional(),
        metadata: Joi.object().optional()
    });

    constructor(data: AdminCreateTransactionDto) {
        this.userId = data.userId;
        this.type = data.type;
        this.amount = data.amount;
        this.method = data.method;
        this.fee = data.fee;
        this.notes = data.notes;
        this.metadata = data.metadata;
    }
}