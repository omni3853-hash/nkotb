import { CreatePaymentMethodDto, PaymentMethodQueryDto, UpdatePaymentMethodDto } from '@/lib/dto/paymentMethod.dto';
import { IPaymentMethod } from '../models/payment-method.model';

export interface PaymentMethodService {
  create(adminId: string, data: CreatePaymentMethodDto): Promise<IPaymentMethod>;
  update(adminId: string, id: string, data: UpdatePaymentMethodDto): Promise<IPaymentMethod>;
  delete(adminId: string, id: string): Promise<void>;
  adminGetById(id: string): Promise<IPaymentMethod>;
  adminList(query: PaymentMethodQueryDto): Promise<{ items: IPaymentMethod[]; total: number; page: number; limit: number }>;
  toggleStatus(adminId: string, id: string, status: boolean): Promise<IPaymentMethod>;
  setDefault(adminId: string, id: string): Promise<IPaymentMethod>;

  // User
  userListActive(query: PaymentMethodQueryDto): Promise<{ items: IPaymentMethod[]; total: number; page: number; limit: number }>;
}
