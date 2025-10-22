import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { AccountType } from '../enums/account.enum';
import type { IUser } from './user.model';

export interface IPaymentMethod extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  type: AccountType;

  // Crypto
  cryptocurrency?: string;
  network?: string;
  walletAddress?: string;
  qrCode?: string;

  // Bank
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  routingNumber?: string;
  swiftCode?: string;

  // Mobile
  provider?: string;
  handle?: string;
  email?: string;

  // Common
  status: boolean;
  processingTime: string;
  fee: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPaymentMethodPopulated extends Omit<IPaymentMethod, 'user'> {
  user: IUser;
}

const PaymentMethodSchema: Schema<IPaymentMethod> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: AccountType, required: true },
    // Crypto
    cryptocurrency: { type: String },
    network: { type: String },
    walletAddress: { type: String },
    qrCode: { type: String },
    // Bank
    bankName: { type: String },
    accountName: { type: String },
    accountNumber: { type: String },
    routingNumber: { type: String },
    swiftCode: { type: String },
    // Mobile
    provider: { type: String },
    handle: { type: String },
    email: { type: String },
    // Common
    status: { type: Boolean, default: true },
    processingTime: { type: String, default: '1-3 business days' },
    fee: { type: Number, default: 0 },
    isDefault: { type: Boolean, default: false }
  },
  { timestamps: true }
);

PaymentMethodSchema.index({ user: 1, type: 1 });
PaymentMethodSchema.index({ walletAddress: 1 }, { sparse: true });
PaymentMethodSchema.index({ accountNumber: 1 }, { sparse: true });

export const PaymentMethod: Model<IPaymentMethod> =
  mongoose.models.PaymentMethod || mongoose.model<IPaymentMethod>('PaymentMethod', PaymentMethodSchema);
