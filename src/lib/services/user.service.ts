import { IUser } from "@/lib/models/user.model";
import { ChangePasswordDto } from "@/lib/dto/auth.dto";
import { UpdateSelfDto, AdminUpdateUserDto } from "@/lib/dto/user.dto";

export interface UserService {
  me(userId: string): Promise<IUser>;
  updateMe(userId: string, dto: UpdateSelfDto): Promise<IUser>;
  changePassword(userId: string, dto: ChangePasswordDto): Promise<void>;

  // Admin
  getById(userId: string): Promise<IUser>;
  list(query?: { search?: string; page?: number; limit?: number; status?: string }): Promise<{ items: IUser[]; total: number; page: number; limit: number }>;
  adminUpdate(adminId: string, targetUserId: string, dto: AdminUpdateUserDto): Promise<IUser>;
  adminDelete(adminId: string, targetUserId: string): Promise<void>;
}
