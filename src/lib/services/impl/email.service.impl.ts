import nodemailer from 'nodemailer';
import { EmailService } from '../email.service';
import { CustomError } from '../../utils/customError.utils';

const APP = process.env.APP_NAME || 'Cargo Pulse';
const BRAND = process.env.EMAIL_FROM_NAME || APP;
const COLOR = process.env.MAJOR_COLOR || '#FF5A00';
const LOGO = process.env.LOGO_URL || '';
const FROM = `"${BRAND}" <${process.env.EMAIL_USER}>`;

class EmailServiceImpl implements EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '465', 10),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // --- NEW: Email Verification OTP ---
  async sendEmailVerificationOTP(email: string, fullName: string, otp: string): Promise<void> {
    await this.sendEmail({
      from: FROM,
      to: email,
      subject: `Verify your email for ${APP}`,
      html: this.otpTemplate({
        title: 'Verify your email',
        greetingName: fullName || 'there',
        otp,
        hint: 'Use this code to verify your email address.',
      }),
    });
  }

  // --- NEW: Login OTP ---
  async sendLoginOTP(email: string, fullName: string, otp: string): Promise<void> {
    await this.sendEmail({
      from: FROM,
      to: email,
      subject: `Your ${APP} login code`,
      html: this.otpTemplate({
        title: 'Login verification',
        greetingName: fullName || 'there',
        otp,
        hint: 'Use this code to complete your sign-in.',
      }),
    });
  }

  async sendWelcomeEmail(email: string, userName: string): Promise<void> {
    await this.sendEmail({
      from: FROM,
      to: email,
      subject: `Welcome to ${APP}!`,
      html: this.getWelcomeTemplate(userName),
    });
  }

  async sendPasswordResetEmail(email: string, otp: string): Promise<void> {
    await this.sendEmail({
      from: FROM,
      to: email,
      subject: `Password Reset OTP`,
      html: this.getPasswordResetTemplate(otp),
    });
  }

  // ---------- base sender ----------
  private async sendEmail(options: nodemailer.SendMailOptions): Promise<void> {
    try {
      const info = await this.transporter.sendMail(options);
      if (info.rejected && info.rejected.length > 0) {
        throw new CustomError(500, 'Failed to send email');
      }
    } catch (err) {
      console.error('Email sending error:', err);
      throw new CustomError(500, 'Failed to send email');
    }
  }

  // ---------- shared OTP template ----------
  private otpTemplate({ title, greetingName, otp, hint }: { title: string; greetingName: string; otp: string; hint: string; }): string {
    return `
    <html><body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f7f7f7;">
      <div style="max-width:620px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee">
        <div style="padding:20px;background:${COLOR};color:#fff;">
          <table width="100%"><tr>
            <td style="font-size:20px;font-weight:700">${APP}</td>
            <td align="right">${LOGO ? `<img alt="${APP}" src="${LOGO}" height="32" style="display:inline-block;border-radius:4px"/>` : ''}</td>
          </tr></table>
          <div style="font-size:16px;margin-top:6px">${title}</div>
        </div>
        <div style="padding:24px;">
          <p style="margin:0 0 12px">Hi ${greetingName},</p>
          <p style="margin:0 0 20px">${hint}</p>
          <div style="font-size:36px; font-weight:800; letter-spacing:6px; text-align:center; padding:12px 0">${otp}</div>
          <p style="color:#666">This code expires in 10 minutes. If you didn’t request it, you can safely ignore this email.</p>
        </div>
        <div style="padding:14px 20px; background:#fafafa; color:#666; font-size:12px;">
          Need help? Contact <a href="mailto:${process.env.CONTACT_INFO}" style="color:${COLOR}; text-decoration:none">${process.env.CONTACT_INFO}</a>.
        </div>
      </div>
    </body></html>`;
  }

  private getWelcomeTemplate(userName: string): string {
    return `
      <html><body style="font-family:Arial;background:#f4f4f4;margin:0;padding:20px">
      <div style="max-width:600px;margin:0 auto;background:#fff;padding:20px;border-radius:8px;border:1px solid #eee">
        <div style="background:${COLOR};color:#fff;padding:20px;border-radius:8px 8px 0 0;text-align:center">
          <h1 style="margin:0;font-size:22px">Welcome to ${APP}!</h1>
        </div>
        <p>Hello ${userName}, welcome aboard!</p>
      </div></body></html>
    `;
  }

  private getPasswordResetTemplate(otp: string): string {
    return `
      <html><body style="font-family:Arial;background:#f4f4f4;margin:0;padding:20px">
      <div style="max-width:600px;margin:0 auto;background:#fff;padding:20px;border-radius:8px;border:1px solid #eee">
        <div style="background:#dc3545;color:#fff;padding:20px;border-radius:8px 8px 0 0;text-align:center">
          <h1 style="margin:0;font-size:22px">Password Reset</h1>
        </div>
        <p>Use this code to reset your password:</p>
        <div style="font-size:32px;font-weight:700;letter-spacing:6px;text-align:center;margin:24px 0">${otp}</div>
      </div></body></html>
    `;
  }

  async sendEmailVerifiedNotice(email: string, fullName: string): Promise<void> {
    await this.sendEmail({
      from: FROM,
      to: email,
      subject: `Your ${APP} email is verified`,
      html: this.simpleCardTemplate({
        title: 'Email verified ✅',
        body: `Hi ${fullName || 'there'}, your email address has been successfully verified. You’re all set to continue.`,
      }),
    });
  }

  // helper simple template
  private simpleCardTemplate({ title, body }: { title: string; body: string }) {
    return `
      <html><body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f7f7f7;">
        <div style="max-width:620px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee">
          <div style="padding:20px;background:${COLOR};color:#fff;">
            <table width="100%"><tr>
              <td style="font-size:20px;font-weight:700">${APP}</td>
              <td align="right">${LOGO ? `<img alt="${APP}" src="${LOGO}" height="32" style="display:inline-block;border-radius:4px"/>` : ''}</td>
            </tr></table>
            <div style="font-size:16px;margin-top:6px">${title}</div>
          </div>
          <div style="padding:24px;color:#222">${body}</div>
          <div style="padding:14px 20px;background:#fafafa;color:#666;font-size:12px;">
            Need help? Contact <a href="mailto:${process.env.CONTACT_INFO}" style="color:${COLOR};text-decoration:none">${process.env.CONTACT_INFO}</a>.
          </div>
        </div>
      </body></html>
    `;
  }

  async sendMembershipPurchaseReceived(email: string, fullName: string, planName: string) {
    await this.sendEmail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Cargo Pulse'}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `We received your ${planName} membership request`,
      html: this.simpleCardTemplate({
        title: "Membership submitted",
        body: `Hi ${fullName || "there"}, we’ve received your request for the <b>${planName}</b> plan. We’ll notify you when it’s activated.`,
      }),
    });
  }

  async sendMembershipActivated(email: string, fullName: string, planName: string, expiresAt: Date) {
    await this.sendEmail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Cargo Pulse'}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `${planName} membership is active`,
      html: this.simpleCardTemplate({
        title: "Membership activated ✅",
        body: `Hi ${fullName || "there"}, your <b>${planName}</b> membership is now active. It will expire on <b>${expiresAt.toDateString()}</b>.`,
      }),
    });
  }

  async sendMembershipStatusChanged(email: string, fullName: string, planName: string, oldStatus: string, newStatus: string) {
    await this.sendEmail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Cargo Pulse'}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Membership status updated`,
      html: this.simpleCardTemplate({
        title: "Membership status changed",
        body: `Hi ${fullName || "there"}, your <b>${planName}</b> membership status changed from <b>${oldStatus}</b> to <b>${newStatus}</b>.`,
      }),
    });
  }

  async sendMembershipUpgraded(email: string, fullName: string, fromPlan: string, toPlan: string) {
    await this.sendEmail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Cargo Pulse'}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Upgrade to ${toPlan} submitted`,
      html: this.simpleCardTemplate({
        title: "Upgrade received",
        body: `Hi ${fullName || "there"}, we’ve received your upgrade from <b>${fromPlan}</b> to <b>${toPlan}</b>. We’ll notify you once it’s active.`,
      }),
    });
  }

  async sendMembershipExpiringSoon(email: string, fullName: string, planName: string, expiresAt: Date) {
    await this.sendEmail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Cargo Pulse'}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `${planName} membership expiring soon`,
      html: this.simpleCardTemplate({
        title: "Membership expiring soon",
        body: `Hi ${fullName || "there"}, your <b>${planName}</b> membership expires on <b>${expiresAt.toDateString()}</b>. Turn on auto-renew to stay uninterrupted.`,
      }),
    });
  }

  async sendProfileUpdated(email: string, fullName: string): Promise<void> {
    await this.sendEmail({
      from: FROM,
      to: email,
      subject: `Your profile was updated`,
      html: this.simpleCardTemplate({
        title: 'Profile updated',
        body: `Hi ${fullName || 'there'}, your profile details were updated successfully.`,
      }),
    });
  }

  async sendAdminAccountUpdated(email: string, fullName: string): Promise<void> {
    await this.sendEmail({
      from: FROM,
      to: email,
      subject: `Your account was updated by an administrator`,
      html: this.simpleCardTemplate({
        title: 'Account changes applied',
        body: `Hi ${fullName || 'there'}, an administrator updated your account details. If this wasn’t you, please contact support immediately.`,
      }),
    });
  }

  async sendPasswordChanged(email: string, fullName: string): Promise<void> {
    await this.sendEmail({
      from: FROM,
      to: email,
      subject: `Your password was changed`,
      html: this.simpleCardTemplate({
        title: 'Password changed',
        body: `Hi ${fullName || 'there'}, your password has been updated. If you didn’t do this, reset your password and contact support immediately.`,
      }),
    });
  }

  async sendPlatformUpdatedDigestToAdmin(email: string): Promise<void> {
    await this.sendEmail({
      from: FROM,
      to: email,
      subject: `Platform settings updated`,
      html: this.simpleCardTemplate({
        title: 'Platform updated',
        body: `Hello, platform settings were updated successfully. Review audit logs for details.`,
      }),
    });
  }

  async sendDeliveryRequestSubmitted(
    email: string,
    fullName: string,
    optionName: string,
    address: { street: string; city: string; state: string; country: string; zipCode: string; },
    specialInstruction?: string
  ): Promise<void> {
    const addressHtml = `
      <div style="line-height:1.6">
        <div><b>Street:</b> ${address.street}</div>
        <div><b>City:</b> ${address.city}</div>
        <div><b>State:</b> ${address.state}</div>
        <div><b>Country:</b> ${address.country}</div>
        <div><b>Zip Code:</b> ${address.zipCode}</div>
      </div>
    `;
    const body = `
      <p>Hi ${fullName || "there"}, your delivery request has been received and is now <b>Pending</b>.</p>
      <p><b>Delivery option:</b> ${optionName}</p>
      <p><b>Delivery address:</b></p>${addressHtml}
      ${specialInstruction ? `<p><b>Special instruction:</b> ${specialInstruction}</p>` : ""}
      <p>We’ll keep you posted as the status changes.</p>
    `;
    await this.sendEmail({
      from: FROM,
      to: email,
      subject: `Delivery request submitted — ${APP}`,
      html: this.simpleCardTemplate({ title: "Delivery request received", body }),
    });
  }

  async sendDeliveryRequestStatusChanged(
    email: string,
    fullName: string,
    optionName: string,
    status: string,
    reason?: string
  ): Promise<void> {
    const nice =
      status === "APPROVED" ? "Approved ✅" :
        status === "COMPLETED" ? "Completed 🎉" :
          status === "REJECTED" ? "Rejected ❌" :
            "Pending ⏳";

    const extras = reason && status === "REJECTED" ? `<p><b>Reason:</b> ${reason}</p>` : "";
    const body = `
      <p>Hi ${fullName || "there"}, the status of your delivery request has changed.</p>
      <p><b>Delivery option:</b> ${optionName}</p>
      <p><b>New status:</b> ${nice}</p>
      ${extras}
    `;
    await this.sendEmail({
      from: FROM,
      to: email,
      subject: `Delivery request ${status.toLowerCase()} — ${APP}`,
      html: this.simpleCardTemplate({ title: "Status updated", body }),
    });
  }

  /* ------------------------ Delivery Option Admin Digest ------------------- */

  async sendDeliveryOptionDigestToAdmin(
    email: string,
    action: "CREATED" | "UPDATED" | "DELETED" | "TOGGLED",
    payload: { name: string; price?: number; deliveryTime?: string; isActive?: boolean; description?: string }
  ): Promise<void> {
    const body = `
      <p>An administrator performed a <b>${action}</b> action on a delivery option.</p>
      <p><b>Name:</b> ${payload.name}</p>
      ${payload.price !== undefined ? `<p><b>Price:</b> ${payload.price}</p>` : ""}
      ${payload.deliveryTime ? `<p><b>Delivery Time:</b> ${payload.deliveryTime}</p>` : ""}
      ${payload.isActive !== undefined ? `<p><b>Active:</b> ${payload.isActive}</p>` : ""}
      ${payload.description ? `<p><b>Description:</b> ${payload.description}</p>` : ""}
      <p>Check audit logs for more details.</p>
    `;
    await this.sendEmail({
      from: FROM,
      to: email,
      subject: `Delivery option ${action.toLowerCase()} — ${APP}`,
      html: this.simpleCardTemplate({ title: "Delivery option update", body }),
    });
  }

  async sendAccountDeleted(email: string, fullName: string): Promise<void> {
    await this.sendEmail({
      from: FROM,
      to: email,
      subject: `Your ${APP} account has been deleted`,
      html: this.simpleCardTemplate({
        title: "Account deleted",
        body: `Hi ${fullName || "there"}, your ${APP} account has been deleted by an administrator. If you believe this was a mistake, please reply to this email.`,
      }),
    });
  }
}

export default EmailServiceImpl;
