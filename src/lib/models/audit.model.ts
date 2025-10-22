import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import type { IUser } from './user.model';

export interface IAudit extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuditPopulated extends Omit<IAudit, 'user'> {
  user: IUser;
}

const AuditSchema: Schema<IAudit> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: { type: String },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

AuditSchema.index({ user: 1, createdAt: -1 });
AuditSchema.index({ action: 1 });
AuditSchema.index({ resource: 1 });

export const Audit: Model<IAudit> =
  mongoose.models.Audit || mongoose.model<IAudit>('Audit', AuditSchema);
