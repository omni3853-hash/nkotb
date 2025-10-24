export interface EmailService {
  // Auth / OTP
  sendEmailVerificationOTP(email: string, fullName: string, otp: string): Promise<void>;
  sendLoginOTP(email: string, fullName: string, otp: string): Promise<void>;
  sendEmailVerifiedNotice(email: string, fullName: string): Promise<void>;
  sendWelcomeEmail(email: string, userName: string): Promise<void>;
  sendPasswordResetEmail(email: string, otp: string): Promise<void>;

  // Membership
  sendMembershipPurchaseReceived?(
    email: string,
    fullName: string,
    planName: string
  ): Promise<void>;
  sendMembershipActivated?(
    email: string,
    fullName: string,
    planName: string,
    expiresAt: Date
  ): Promise<void>;
  sendMembershipStatusChanged?(
    email: string,
    fullName: string,
    planName: string,
    oldStatus: string,
    newStatus: string
  ): Promise<void>;
  sendMembershipUpgraded?(
    email: string,
    fullName: string,
    fromPlan: string,
    toPlan: string
  ): Promise<void>;
  sendMembershipExpiringSoon?(
    email: string,
    fullName: string,
    planName: string,
    expiresAt: Date
  ): Promise<void>;

  // Account (NEW)
  sendProfileUpdated?(email: string, fullName: string): Promise<void>;
  sendAdminAccountUpdated?(email: string, fullName: string): Promise<void>;
  sendPasswordChanged?(email: string, fullName: string): Promise<void>;
  sendAccountDeleted?(email: string, fullName: string): Promise<void>;

  // Platform (NEW)
  sendPlatformUpdatedDigestToAdmin?(email: string): Promise<void>;

  // Delivery (existing + improved)
  sendDeliveryRequestSubmitted?(
    email: string,
    fullName: string,
    optionName: string,
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      zipCode: string;
    },
    specialInstruction?: string
  ): Promise<void>;

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

  // Bookings & Celebrities (NEW)
  sendCelebrityPublished?(
    celebrityName: string,
    slug: string,
    category: string
  ): Promise<void>;

  sendBookingSubmitted?(
    email: string,
    fullName: string,
    celebrityName: string,
    bookingTypeName: string,
    quantity: number,
    totalAmount: number,
    currency?: string
  ): Promise<void>;

  sendBookingStatusChanged?(
    email: string,
    fullName: string,
    celebrityName: string,
    bookingTypeName: string,
    status: string,
    reason?: string,
    currency?: string,
    totalAmount?: number
  ): Promise<void>;
  sendEventPublished?(
    eventTitle: string,
    slug: string,
    category: string,
    date?: string,
    location?: string
  ): Promise<void>;

  sendTicketPurchased?(
    email: string,
    fullName: string,
    eventTitle: string,
    ticketTypeName: string,
    quantity: number,
    totalAmount: number,
    currency?: string
  ): Promise<void>;

  sendTicketStatusChanged?(
    email: string,
    fullName: string,
    eventTitle: string,
    ticketTypeName: string,
    status: string,
    reason?: string,
    currency?: string,
    totalAmount?: number
  ): Promise<void>;
  sendDepositReceived(email: string, fullName: string, amount: number, depositId: string): Promise<void>;
  sendDepositQueuedForReview(email: string, fullName: string, amount: number, depositId: string): Promise<void>;
  sendDepositApproved(email: string, fullName: string, amount: number, depositId: string): Promise<void>;
  sendDepositFailed(email: string, fullName: string, amount: number, depositId: string, reason: string): Promise<void>;
}
