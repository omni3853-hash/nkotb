export interface EmailService {
  // Auth / OTP
  sendEmailVerificationOTP(email: string, fullName: string, otp: string): Promise<void>;
  sendLoginOTP(email: string, fullName: string, otp: string): Promise<void>;
  sendEmailVerifiedNotice(email: string, fullName: string): Promise<void>;
  sendWelcomeEmail(email: string, userName: string): Promise<void>;
  sendPasswordResetEmail(email: string, otp: string): Promise<void>;

  // Membership
  sendMembershipPurchaseReceived?(email: string, fullName: string, planName: string): Promise<void>;
  sendMembershipActivated?(email: string, fullName: string, planName: string, expiresAt: Date): Promise<void>;
  sendMembershipStatusChanged?(email: string, fullName: string, planName: string, oldStatus: string, newStatus: string): Promise<void>;
  sendMembershipUpgraded?(email: string, fullName: string, fromPlan: string, toPlan: string): Promise<void>;
  sendMembershipExpiringSoon?(email: string, fullName: string, planName: string, expiresAt: Date): Promise<void>;

  // Account (NEW)
  sendProfileUpdated?(email: string, fullName: string): Promise<void>;
  sendAdminAccountUpdated?(email: string, fullName: string): Promise<void>;
  sendPasswordChanged?(email: string, fullName: string): Promise<void>;

  // Platform (NEW)
  sendPlatformUpdatedDigestToAdmin?(email: string): Promise<void>;

  sendDeliveryRequestSubmitted?(email: string, fullName: string, optionName: string, address: {
    street: string; city: string; state: string; country: string; zipCode: string;
  }, specialInstruction?: string): Promise<void>;

  sendDeliveryRequestStatusChanged?(
    email: string,
    fullName: string,
    optionName: string,
    status: string,
    reason?: string
  ): Promise<void>;

  sendDeliveryOptionDigestToAdmin?(
    email: string,
    action: "CREATED" | "UPDATED" | "DELETED" | "TOGGLED",
    payload: { name: string; price?: number; deliveryTime?: string; isActive?: boolean; description?: string }
  ): Promise<void>;
  sendAccountDeleted?(email: string, fullName: string): Promise<void>;
}
