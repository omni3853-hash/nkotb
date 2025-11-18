import nodemailer, { SendMailOptions } from "nodemailer";
import { EmailService } from "../email.service";
import { CustomError } from "../../utils/customError.utils";
import QRCode from "qrcode";

/**
 * Brand tokens (env-driven)
 */
const APP = process.env.APP_NAME || "NKOTB";
const BRAND = process.env.EMAIL_FROM_NAME || APP;
const COLOR = process.env.MAJOR_COLOR || "#4F46E5"; // default indigo
const ACCENT = process.env.MINOR_COLOR || "#22C55E"; // default green
const LOGO = process.env.LOGO_URL || "";
const CONTACT = process.env.CONTACT_INFO || "support@example.com"; // kept but not rendered to users
const FRONTEND_URL = process.env.FRONTEND_URL || "#";
const FROM = `"${BRAND}" <${process.env.EMAIL_USER}>`;
const DEFAULT_CURRENCY = process.env.CURRENCY || "USD";
const NOTIFY_EMAILS = (process.env.NOTIFY_EMAILS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/**
 * Helpers
 */
const nf = (currency?: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || DEFAULT_CURRENCY,
  });

const fmtDate = (d: Date) =>
  new Date(d).toLocaleString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

/**
 * Base email layout
 */
function layout(params: {
  title: string;
  preheader?: string;
  bodyHtml: string;
  cta?: { label: string; href: string } | null;
  footerNoteHtml?: string;
}) {
  const { title, preheader, bodyHtml, cta, footerNoteHtml } = params;
  const pre = preheader
    ? preheader.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    : "";

  return `
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>${title}</title>
    <style>
      @media screen and (max-width: 600px) {
        .container { width: 100% !important; border-radius: 0 !important; }
        .px { padding-left: 16px !important; padding-right: 16px !important; }
      }
      .btn:hover { opacity: .92 !important; }
    </style>
  </head>
  <body style="margin:0;background:#f6f7fb;">
    ${pre
      ? `<span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;">${pre}</span>`
      : ""
    }
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f6f7fb;">
      <tr>
        <td align="center" style="padding:28px 16px;">
          <table class="container" role="presentation" cellpadding="0" cellspacing="0" width="620" style="width:620px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #eaeaf1;box-shadow:0 10px 25px rgba(2,6,23,.06);">
            <!-- Header -->
            <tr>
              <td style="padding:0;">
                <div style="background: linear-gradient(135deg, ${COLOR}, ${ACCENT}); padding: 22px 24px; color:#fff;">
                  <table width="100%" role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="left" style="font-weight:800;font-size:18px;letter-spacing:.2px">${APP}</td>
                      <td align="right">
                        ${LOGO
      ? `<img src="${LOGO}" alt="${APP}" height="32" style="display:inline-block;border-radius:6px;border:1px solid rgba(255,255,255,.25)" />`
      : ""
    }
                      </td>
                    </tr>
                  </table>
                  <div style="font-size:14px;opacity:.95;margin-top:6px;">${title}</div>
                </div>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td class="px" style="padding:24px 24px 8px;color:#0f172a;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;">
                ${bodyHtml}
                ${cta ? button(cta.label, cta.href) : ""}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td class="px" style="padding:16px 24px 22px;">
                <div style="height:1px;background:#eef0f4;margin:8px 0 12px;"></div>
                ${footerNoteHtml || ""}

                <!-- Visit Website button -->
                <div style="text-align:center;margin-top:12px;">
                  <a
                    href="${FRONTEND_URL}"
                    class="btn"
                    style="background:${COLOR};border:1px solid ${COLOR};color:#fff;display:inline-block;font-weight:600;font-size:12px;line-height:32px;text-decoration:none;border-radius:999px;padding:0 18px;min-width:0;"
                  >
                    Visit Website
                  </a>
                </div>

                <!-- Visit Support button -->
                <div style="text-align:center;margin-top:8px;">
                  <a
                    href="${FRONTEND_URL}/support"
                    class="btn"
                    style="background:#0f172a;border:1px solid #0f172a;color:#fff;display:inline-block;font-weight:600;font-size:12px;line-height:32px;text-decoration:none;border-radius:999px;padding:0 18px;min-width:0;"
                  >
                    Visit Support
                  </a>
                </div>

                <!-- Raw support link under the button -->
                <div style="text-align:center;margin-top:6px;font-size:11px;color:#64748b;word-break:break-all;">
                  Support page:
                  <a href="${FRONTEND_URL}/support" style="color:${COLOR};text-decoration:none;">
                    ${FRONTEND_URL}/support
                  </a>
                </div>

                <div style="text-align:center;margin-top:8px;color:#64748b;font-size:12px;">
                  ${BRAND}
                </div>
              </td>
            </tr>

          </table>
          <div style="font-size:10px;color:#94a3b8;margin-top:10px;">
            This is an automated notification from ${APP}.
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}

function button(label: string, href: string) {
  return `
  <div style="text-align:center;margin:24px 0 6px;">
    <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${href}" arcsize="12%" strokecolor="${COLOR}" fillcolor="${COLOR}" style="height:44px;v-text-anchor:middle;width:240px;">
        <w:anchorlock/>
        <center style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;">
          ${label}
        </center>
      </v:roundrect>
    <![endif]-->
    <a href="${href}" class="btn" style="background:${COLOR};border:1px solid ${COLOR};color:#fff;display:inline-block;font-weight:700;font-size:14px;line-height:44px;text-decoration:none;border-radius:9px;padding:0 24px;min-width:240px;">
      ${label}
    </a>
  </div>
  `;
}

function detail(label: string, value: string) {
  return `
  <tr>
    <td style="padding:8px 12px;border-bottom:1px solid #eef0f4;background:#fafbff;width:42%;color:#334155;font-weight:600;">${label}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #eef0f4;color:#0f172a;">${value}</td>
  </tr>`;
}

function infoCard(title: string, contentHtml: string) {
  return `
  <div style="border:1px solid #eef0f4;border-radius:12px;overflow:hidden;margin:10px 0 6px;">
    <div style="background:#f8fafc;color:#0f172a;font-weight:700;padding:10px 14px;">${title}</div>
    <div style="padding:14px;">${contentHtml}</div>
  </div>`;
}

function otpBlock(otp: string) {
  return `
  <div style="background: #0f172a; background-image: linear-gradient(180deg, #0b1220, #111827); color:#fff; border-radius:14px; padding:22px; text-align:center; margin:18px 0;">
    <div style="font-size:12px;letter-spacing:.2px;opacity:.85;margin-bottom:6px;">Your one-time code</div>
    <div style="font-size:34px;font-weight:900;letter-spacing:10px;font-family:monospace">${otp}</div>
    <div style="font-size:12px;opacity:.85;margin-top:6px;">Expires in 10 minutes</div>
  </div>`;
}

/**
 * Implementation
 */
export class EmailServiceImpl implements EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "465", 10),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  /* -------------------------------- Base sender -------------------------------- */

  private async sendEmail(options: SendMailOptions): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: options.from || FROM,
        ...options,
      });
      if (info.rejected && info.rejected.length > 0) {
        throw new CustomError(500, "Failed to send email");
      }
    } catch (err) {
      console.error("Email sending error:", err);
      throw new CustomError(500, "Failed to send email");
    }
  }

  /* ---------------------------- Auth / OTP / Welcome --------------------------- */

  async sendEmailVerificationOTP(
    email: string,
    fullName: string,
    otp: string
  ): Promise<void> {
    const body = `
      <p style="margin:0 0 8px;">Hi ${fullName || "there"},</p>
      <p style="margin:0 0 12px;">Use the code below to verify your email address for <b>${APP}</b>.</p>
      ${otpBlock(otp)}
      ${infoCard(
      "Security tip",
      `<p style="margin:0;color:#475569;">We will never ask you for this code. If you didn’t request it, you can ignore this email.</p>`
    )}
    `;

    await this.sendEmail({
      to: email,
      subject: `Verify your email — ${APP}`,
      html: layout({
        title: "Verify your email",
        preheader: "Use your code to finish email verification",
        bodyHtml: body,
        cta: { label: "Open dashboard", href: FRONTEND_URL },
        footerNoteHtml: `<div style="font-size:12px;color:#64748b;text-align:center;">Having trouble? You can always return to your account settings to complete verification.</div>`,
      }),
    });
  }

  async sendLoginOTP(
    email: string,
    fullName: string,
    otp: string
  ): Promise<void> {
    const body = `
      <p style="margin:0 0 8px;">Hi ${fullName || "there"},</p>
      <p style="margin:0 0 12px;">Enter this code to complete your sign-in to <b>${APP}</b>.</p>
      ${otpBlock(otp)}
      <p style="margin:8px 0 0;color:#475569;">If you didn’t start a login, you can safely ignore this message.</p>
    `;
    await this.sendEmail({
      to: email,
      subject: `Your login code — ${APP}`,
      html: layout({
        title: "Login verification",
        preheader: "Enter this code to complete your sign-in",
        bodyHtml: body,
        cta: { label: "Continue login", href: FRONTEND_URL },
      }),
    });
  }

  async sendWelcomeEmail(email: string, userName: string): Promise<void> {
    const body = `
      <p style="margin:0 0 10px;">Hi ${userName || "there"},</p>
      <p style="margin:0 0 12px;">Welcome to <b>${APP}</b> — we’re excited to have you on board.</p>
      ${infoCard(
      "Quick start",
      `
        <ul style="margin:0;padding-left:18px;color:#0f172a;">
          <li>Complete your profile</li>
          <li>Explore membership benefits</li>
          <li>Enable 2-step verification</li>
        </ul>
      `
    )}
    `;
    await this.sendEmail({
      to: email,
      subject: `Welcome to ${APP}!`,
      html: layout({
        title: "Welcome aboard",
        preheader: "Your account is ready — let's get started",
        bodyHtml: body,
        cta: { label: "Open dashboard", href: FRONTEND_URL },
      }),
    });
  }

  async sendPasswordResetEmail(
    email: string,
    tokenOrLink: string
  ): Promise<void> {
    const link = tokenOrLink.startsWith("http")
      ? tokenOrLink
      : `${FRONTEND_URL}/auth/reset?token=${encodeURIComponent(tokenOrLink)}`;
    const body = `
      <p style="margin:0 0 10px;">You requested a password reset for <b>${APP}</b>.</p>
      <p style="margin:0 0 12px;">Click the button below to choose a new password. The link expires in 60 minutes.</p>
      <p style="margin:10px 0 0;color:#475569;">If you didn’t request this, you can ignore this email.</p>
    `;
    await this.sendEmail({
      to: email,
      subject: `Reset your password — ${APP}`,
      html: layout({
        title: "Reset your password",
        preheader: "Use the link to set a new password",
        bodyHtml: body,
        cta: { label: "Reset password", href: link },
      }),
    });
  }

  async sendEmailVerifiedNotice(
    email: string,
    fullName: string
  ): Promise<void> {
    const body = `<p style="margin:0;">Hi ${fullName || "there"
      }, your email address has been successfully verified. You’re all set.</p>`;
    await this.sendEmail({
      to: email,
      subject: `Email verified — ${APP}`,
      html: layout({
        title: "Email verified ✅",
        preheader: "Thanks for verifying your email",
        bodyHtml: body,
        cta: { label: "Open dashboard", href: FRONTEND_URL },
      }),
    });
  }

  /* --------------------------------- Membership -------------------------------- */

  async sendMembershipPurchaseReceived(
    email: string,
    fullName: string,
    planName: string
  ) {
    const body = `
      <p style="margin:0 0 10px;">Hi ${fullName || "there"
      }, we’ve received your request for the <b>${planName}</b> plan.</p>
      ${infoCard(
        "What happens next?",
        `<p style="margin:0;color:#475569;">We’re reviewing your purchase and will notify you once it’s activated.</p>`
      )}
    `;
    await this.sendEmail({
      to: email,
      subject: `We received your ${planName} membership`,
      html: layout({
        title: "Membership submitted",
        preheader: "We’re reviewing your membership purchase",
        bodyHtml: body,
        cta: { label: "View membership", href: `${FRONTEND_URL}/membership` },
      }),
    });
  }

  async sendMembershipActivated(
    email: string,
    fullName: string,
    planName: string,
    expiresAt: Date
  ) {
    const body = `
      <p style="margin:0 0 10px;">Hi ${fullName || "there"
      }, your <b>${planName}</b> membership is now active.</p>
      ${infoCard(
        "Details",
        `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
          ${detail("Plan", planName)}
          ${detail("Expires", fmtDate(expiresAt))}
        </table>
      `
      )}
    `;
    await this.sendEmail({
      to: email,
      subject: `${planName} membership activated`,
      html: layout({
        title: "Membership activated ✅",
        preheader: "Your plan is live — enjoy the benefits",
        bodyHtml: body,
        cta: {
          label: "Manage membership",
          href: `${FRONTEND_URL}/membership`,
        },
      }),
    });
  }

  async sendMembershipStatusChanged(
    email: string,
    fullName: string,
    planName: string,
    oldStatus: string,
    newStatus: string
  ) {
    const body = `
      <p style="margin:0 0 10px;">Hi ${fullName || "there"
      }, your membership status changed.</p>
      ${infoCard(
        "Status update",
        `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          ${detail("Plan", planName)}
          ${detail("From", oldStatus)}
          ${detail("To", newStatus)}
        </table>
      `
      )}
    `;
    await this.sendEmail({
      to: email,
      subject: `Membership status updated`,
      html: layout({
        title: "Membership status changed",
        preheader: `From ${oldStatus} to ${newStatus}`,
        bodyHtml: body,
        cta: { label: "View membership", href: `${FRONTEND_URL}/membership` },
      }),
    });
  }

  async sendMembershipUpgraded(
    email: string,
    fullName: string,
    fromPlan: string,
    toPlan: string
  ) {
    const body = `
      <p style="margin:0 0 10px;">Hi ${fullName || "there"
      }, we’ve received your upgrade request.</p>
      ${infoCard(
        "Upgrade summary",
        `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          ${detail("From", fromPlan)}
          ${detail("To", toPlan)}
        </table>
      `
      )}
    `;
    await this.sendEmail({
      to: email,
      subject: `Upgrade to ${toPlan} received`,
      html: layout({
        title: "Upgrade received",
        preheader: `We’re processing your upgrade to ${toPlan}`,
        bodyHtml: body,
        cta: { label: "Track status", href: `${FRONTEND_URL}/membership` },
      }),
    });
  }

  async sendMembershipExpiringSoon(
    email: string,
    fullName: string,
    planName: string,
    expiresAt: Date
  ) {
    const body = `
      <p style="margin:0 0 10px;">Hi ${fullName || "there"
      }, your <b>${planName}</b> membership expires soon.</p>
      ${infoCard(
        "Expiry",
        `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          ${detail("Plan", planName)}
          ${detail("Expires", fmtDate(expiresAt))}
        </table>
      `
      )}
      <p style="margin:12px 0 0;color:#475569;">Turn on auto-renew to stay uninterrupted.</p>
    `;
    await this.sendEmail({
      to: email,
      subject: `${planName} expires soon`,
      html: layout({
        title: "Membership expiring soon",
        preheader: `Expires ${fmtDate(expiresAt)}`,
        bodyHtml: body,
        cta: { label: "Renew now", href: `${FRONTEND_URL}/membership` },
      }),
    });
  }

  /* ---------------------------------- Account ---------------------------------- */

  async sendProfileUpdated(
    email: string,
    fullName: string
  ): Promise<void> {
    const body = `<p style="margin:0;">Hi ${fullName || "there"
      }, your profile details were updated successfully.</p>`;
    await this.sendEmail({
      to: email,
      subject: `Profile updated — ${APP}`,
      html: layout({
        title: "Profile updated",
        preheader: "Your account details were changed",
        bodyHtml: body,
        cta: {
          label: "Review profile",
          href: `${FRONTEND_URL}/settings/profile`,
        },
      }),
    });
  }

  async sendAdminAccountUpdated(
    email: string,
    fullName: string
  ): Promise<void> {
    const body = `
      <p style="margin:0 0 8px;">Hi ${fullName || "there"
      }, an administrator updated your account.</p>
      <p style="margin:0;color:#475569;">If you didn’t request changes, review your account activity as soon as possible.</p>
    `;
    await this.sendEmail({
      to: email,
      subject: `Your account was updated by an admin`,
      html: layout({
        title: "Account changes applied",
        preheader: "An administrator updated your account",
        bodyHtml: body,
        cta: {
          label: "Open security",
          href: `${FRONTEND_URL}/settings/security`,
        },
      }),
    });
  }

  async sendPasswordChanged(
    email: string,
    fullName: string
  ): Promise<void> {
    const body = `
      <p style="margin:0 0 8px;">Hi ${fullName || "there"
      }, your password has been changed.</p>
      <p style="margin:0;color:#475569;">If this wasn’t you, reset your password and then review your security settings.</p>
    `;
    await this.sendEmail({
      to: email,
      subject: `Password changed — ${APP}`,
      html: layout({
        title: "Password changed",
        preheader: "Your password was just updated",
        bodyHtml: body,
        cta: {
          label: "Review security",
          href: `${FRONTEND_URL}/settings/security`,
        },
      }),
    });
  }

  async sendAccountDeleted(
    email: string,
    fullName: string
  ): Promise<void> {
    const body = `
      <p style="margin:0 0 8px;">Hi ${fullName || "there"
      }, your ${APP} account has been deleted.</p>
      <p style="margin:0;color:#475569;">If this was a mistake, you can visit our website to explore your options.</p>
    `;
    await this.sendEmail({
      to: email,
      subject: `Account deleted — ${APP}`,
      html: layout({
        title: "Account deleted",
        preheader: "Your account has been removed",
        bodyHtml: body,
        cta: { label: "Visit website", href: FRONTEND_URL },
      }),
    });
  }

  /* --------------------------------- Platform ---------------------------------- */

  async sendPlatformUpdatedDigestToAdmin(email: string): Promise<void> {
    const body = `
      <p style="margin:0 0 8px;">Platform settings were updated.</p>
      <p style="margin:0;color:#475569;">Review audit logs for the full breakdown.</p>
    `;
    await this.sendEmail({
      to: email,
      subject: `Platform settings updated — ${APP}`,
      html: layout({
        title: "Platform updated",
        preheader: "Recent platform changes",
        bodyHtml: body,
        cta: {
          label: "Open audit logs",
          href: `${FRONTEND_URL}/admin/audits`,
        },
      }),
    });
  }

  /* --------------------------------- Delivery ---------------------------------- */

  async sendDeliveryRequestSubmitted(
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
  ): Promise<void> {
    const addressTable = `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eef0f4;border-radius:10px;overflow:hidden;">
        ${detail("Street", address.street)}
        ${detail("City", address.city)}
        ${detail("State", address.state)}
        ${detail("Country", address.country)}
        ${detail("Zip Code", address.zipCode)}
      </table>
    `;
    const body = `
      <p style="margin:0 0 10px;">Hi ${fullName || "there"
      }, your delivery request is now <b>Pending</b>.</p>
      ${infoCard(
        "Delivery option",
        `<p style="margin:0;"><b>${optionName}</b></p>`
      )}
      ${infoCard("Delivery address", addressTable)}
      ${specialInstruction
        ? infoCard(
          "Special instruction",
          `<p style="margin:0;">${specialInstruction}</p>`
        )
        : ""
      }
      <p style="margin:10px 0 0;color:#475569;">We’ll keep you posted as the status changes.</p>
    `;
    await this.sendEmail({
      to: email,
      subject: `Delivery request submitted — ${APP}`,
      html: layout({
        title: "Delivery request received",
        preheader: `We received your ${optionName} request`,
        bodyHtml: body,
        cta: { label: "Track request", href: `${FRONTEND_URL}/deliveries` },
      }),
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
      status === "APPROVED"
        ? "Approved ✅"
        : status === "COMPLETED"
          ? "Completed 🎉"
          : status === "REJECTED"
            ? "Rejected ❌"
            : "Pending ⏳";

    const body = `
      <p style="margin:0 0 10px;">Hi ${fullName || "there"
      }, your delivery request status changed.</p>
      ${infoCard(
        "Update",
        `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          ${detail("Option", optionName)}
          ${detail("Status", nice)}
          ${reason && status === "REJECTED"
          ? detail("Reason", reason)
          : ""
        }
        </table>
      `
      )}
    `;
    await this.sendEmail({
      to: email,
      subject: `Delivery request ${status.toLowerCase()} — ${APP}`,
      html: layout({
        title: "Status updated",
        preheader: `Your ${optionName} request is now ${status}`,
        bodyHtml: body,
        cta: { label: "View request", href: `${FRONTEND_URL}/deliveries` },
      }),
    });
  }

  async sendDeliveryOptionDigestToAdmin(
    email: string,
    action: "CREATED" | "UPDATED" | "DELETED" | "TOGGLED",
    payload: {
      name: string;
      price?: number;
      deliveryTime?: string;
      isActive?: boolean;
      description?: string;
    }
  ): Promise<void> {
    const body = `
      <p style="margin:0 0 10px;">A delivery option was <b>${action}</b>.</p>
      ${infoCard(
      "Details",
      `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          ${detail("Name", payload.name)}
          ${payload.price !== undefined
        ? detail("Price", nf().format(payload.price))
        : ""
      }
          ${payload.deliveryTime
        ? detail("Delivery time", payload.deliveryTime)
        : ""
      }
          ${payload.isActive !== undefined
        ? detail("Active", String(payload.isActive))
        : ""
      }
          ${payload.description
        ? detail("Description", payload.description)
        : ""
      }
        </table>
      `
    )}
      <p style="margin:10px 0 0;color:#475569;">Check audit logs for more details.</p>
    `;
    await this.sendEmail({
      to: email,
      subject: `Delivery option ${action.toLowerCase()} — ${APP}`,
      html: layout({
        title: "Delivery option update",
        preheader: `${payload.name} was ${action.toLowerCase()}`,
        bodyHtml: body,
        cta: {
          label: "Open audit logs",
          href: `${FRONTEND_URL}/admin/audits`,
        },
      }),
    });
  }

  /* -------------------------- Bookings & Celebrities --------------------------- */

  async sendCelebrityPublished(
    celebrityName: string,
    slug: string,
    category: string
  ): Promise<void> {
    if (!NOTIFY_EMAILS.length) return;

    const body = `
      <p style="margin:0 0 8px;">A new celebrity profile is live.</p>
      ${infoCard(
      "Celebrity",
      `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          ${detail("Name", celebrityName)}
          ${detail("Category", category)}
          ${detail("Slug", slug)}
        </table>
      `
    )}
    `;

    await this.sendEmail({
      to: NOTIFY_EMAILS,
      subject: `Celebrity published — ${celebrityName}`,
      html: layout({
        title: "Celebrity published",
        preheader: `${celebrityName} is now live`,
        bodyHtml: body,
        cta: {
          label: "View profile",
          href: `${FRONTEND_URL}/celebrities/${slug}`,
        },
      }),
    });
  }

  async sendBookingSubmitted(
    email: string,
    fullName: string,
    celebrityName: string,
    bookingTypeName: string,
    quantity: number,
    totalAmount: number,
    currency?: string
  ): Promise<void> {
    const body = `
      <p style="margin:0 0 10px;">Hi ${fullName || "there"
      }, your booking has been submitted.</p>
      ${infoCard(
        "Booking summary",
        `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          ${detail("Celebrity", celebrityName)}
          ${detail("Type", bookingTypeName)}
          ${detail("Quantity", String(quantity))}
          ${detail("Total", nf(currency).format(totalAmount))}
        </table>
      `
      )}
      <p style="margin:10px 0 0;color:#475569;">We’ll notify you as soon as the status changes.</p>
    `;
    await this.sendEmail({
      to: email,
      subject: `Booking submitted — ${celebrityName}`,
      html: layout({
        title: "Booking received",
        preheader: `${bookingTypeName} x${quantity} for ${celebrityName}`,
        bodyHtml: body,
        cta: { label: "View bookings", href: `${FRONTEND_URL}/bookings` },
      }),
    });
  }

  async sendBookingStatusChanged(
    email: string,
    fullName: string,
    celebrityName: string,
    bookingTypeName: string,
    status: string,
    reason?: string,
    currency?: string,
    totalAmount?: number
  ): Promise<void> {
    const pretty =
      status === "APPROVED"
        ? "Approved ✅"
        : status === "CONFIRMED"
          ? "Confirmed ✅"
          : status === "COMPLETED"
            ? "Completed 🎉"
            : status === "REJECTED"
              ? "Rejected ❌"
              : status === "CANCELLED"
                ? "Cancelled"
                : "Pending ⏳";

    const extra =
      reason && (status === "REJECTED" || status === "CANCELLED")
        ? detail("Reason", reason)
        : "";

    const totalRow =
      typeof totalAmount === "number"
        ? detail("Total", nf(currency).format(totalAmount))
        : "";

    const body = `
      <p style="margin:0 0 10px;">Hi ${fullName || "there"
      }, your booking status changed.</p>
      ${infoCard(
        "Update",
        `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          ${detail("Celebrity", celebrityName)}
          ${detail("Type", bookingTypeName)}
          ${detail("Status", pretty)}
          ${extra}
          ${totalRow}
        </table>
      `
      )}
    `;

    await this.sendEmail({
      to: email,
      subject: `Booking ${status.toLowerCase()} — ${celebrityName}`,
      html: layout({
        title: "Booking status updated",
        preheader: `Your booking is now ${status}`,
        bodyHtml: body,
        cta: { label: "Open bookings", href: `${FRONTEND_URL}/bookings` },
      }),
    });
  }

  async sendEventPublished(
    eventTitle: string,
    slug: string,
    category: string,
    date?: string,
    location?: string
  ): Promise<void> {
    if (!NOTIFY_EMAILS.length) return;

    const details = `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      ${detail("Title", eventTitle)}
      ${detail("Category", category)}
      ${date ? detail("Date", date) : ""}
      ${location ? detail("Location", location) : ""}
      ${detail("Slug", slug)}
    </table>
  `;

    await this.sendEmail({
      to: NOTIFY_EMAILS,
      subject: `Event published — ${eventTitle}`,
      html: layout({
        title: "Event published",
        preheader: `${eventTitle} is now live`,
        bodyHtml: infoCard("Event", details),
        cta: {
          label: "View event",
          href: `${FRONTEND_URL}/events/${slug}`,
        },
      }),
    });
  }

  async sendTicketPurchased(
    email: string,
    fullName: string,
    eventTitle: string,
    ticketTypeName: string,
    quantity: number,
    totalAmount: number,
    currency?: string
  ): Promise<void> {
    const body = `
    <p style="margin:0 0 10px;">Hi ${fullName || "there"
      }, your ticket purchase has been submitted.</p>
    ${infoCard(
        "Order summary",
        `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${detail("Event", eventTitle)}
        ${detail("Ticket", ticketTypeName)}
        ${detail("Quantity", String(quantity))}
        ${detail("Total", nf(currency).format(totalAmount))}
      </table>
    `
      )}
    <p style="margin:10px 0 0;color:#475569;">We’ll notify you as soon as the status changes.</p>
  `;
    await this.sendEmail({
      to: email,
      subject: `Ticket purchase — ${eventTitle}`,
      html: layout({
        title: "Ticket purchase received",
        preheader: `${ticketTypeName} x${quantity} for ${eventTitle}`,
        bodyHtml: body,
        cta: { label: "View tickets", href: `${FRONTEND_URL}/tickets` },
      }),
    });
  }

  /* --------------------- Offline ticket with QR (fixed) ----------------------- */

  async sendOfflineTicketWithQr(params: {
    email: string;
    fullName: string;
    eventTitle: string;
    eventSlug: string;
    ticketTypeName: string;
    quantity: number;
    totalAmount: number;
    currency?: string;
    checkinCode: string;
    ticketId: string;
    eventDate?: string | Date;
    eventLocation?: string;
  }): Promise<void> {
    const {
      email,
      fullName,
      eventTitle,
      eventSlug,
      ticketTypeName,
      quantity,
      totalAmount,
      currency,
      checkinCode,
      ticketId,
      eventDate,
      eventLocation,
    } = params;

    const qrPayload = `${FRONTEND_URL}/tickets/checkin?code=${encodeURIComponent(
      checkinCode
    )}&id=${encodeURIComponent(ticketId)}`;

    const qrBuffer = await QRCode.toBuffer(qrPayload, {
      type: "png",
      margin: 1,
      scale: 6,
    });

    const qrCid = `ticket-qr-${ticketId}@${APP.toLowerCase()}`;

    const formattedDate =
      eventDate != null ? fmtDate(new Date(eventDate)) : "To be announced";

    const body = `
      <p style="margin:0 0 10px;">Hi ${fullName || "there"},</p>
      <p style="margin:0 0 10px;">
        Your ticket purchase has been received. Please keep this email safe – 
        you’ll need the QR code or ticket code below for entry.
      </p>

      ${infoCard(
      "Event details",
      `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          ${detail("Event", eventTitle)}
          ${detail("Date", formattedDate)}
          ${eventLocation ? detail("Location", eventLocation) : ""}
          ${detail("Ticket type", ticketTypeName)}
          ${detail("Quantity", String(quantity))}
          ${detail("Total", nf(currency).format(totalAmount))}
        </table>
      `
    )}

      ${infoCard(
      "Your ticket code",
      `
        <p style="margin:0 0 6px;color:#0f172a;">
          Present this code at the gate or let the usher scan your QR code:
        </p>
        <div style="font-size:16px;font-weight:700;font-family:monospace;color:#0f172a;background:#f1f5f9;padding:10px 12px;border-radius:8px;display:inline-block;">
          ${checkinCode}
        </div>
      `
    )}

      ${infoCard(
      "QR code",
      `
        <div style="text-align:center;">
          <img src="cid:${qrCid}" alt="Ticket QR Code" style="max-width:220px;width:100%;height:auto;border-radius:12px;border:1px solid #e2e8f0;" />
          <p style="margin:8px 0 0;font-size:12px;color:#64748b;">
            Show this QR code at entry – our team will scan it to verify your ticket.
          </p>
        </div>
      `
    )}

      <p style="margin:16px 0 0;color:#475569;font-size:13px;">
        If you believe there is any mistake with your ticket or payment, please visit our support page at
        <a href="${FRONTEND_URL}/support" style="color:${COLOR};text-decoration:none;">${FRONTEND_URL}/support</a>.
      </p>
    `;

    await this.sendEmail({
      to: email,
      subject: `Your offline ticket — ${eventTitle}`,
      html: layout({
        title: "Your ticket is almost ready 🎟️",
        preheader: `Offline ticket for ${eventTitle}`,
        bodyHtml: body,
        cta: {
          label: "View event details",
          href: `${FRONTEND_URL}/events/${eventSlug}`,
        },
        footerNoteHtml:
          '<div style="font-size:12px;color:#64748b;text-align:center;">Bring a valid ID and arrive early to avoid queues.</div>',
      }),
      attachments: [
        {
          filename: `ticket-${ticketId}-qr.png`,
          content: qrBuffer,
          contentType: "image/png",
          cid: qrCid,
        },
      ],
    });
  }

  async sendTicketStatusChanged(
    email: string,
    fullName: string,
    eventTitle: string,
    ticketTypeName: string,
    status: string,
    reason?: string,
    currency?: string,
    totalAmount?: number
  ): Promise<void> {
    const pretty =
      status === "APPROVED"
        ? "Approved ✅"
        : status === "CONFIRMED"
          ? "Confirmed ✅"
          : status === "COMPLETED"
            ? "Completed 🎉"
            : status === "REJECTED"
              ? "Rejected ❌"
              : status === "CANCELLED"
                ? "Cancelled"
                : "Pending ⏳";

    const extra =
      reason && (status === "REJECTED" || status === "CANCELLED")
        ? detail("Reason", reason)
        : "";

    const totalRow =
      typeof totalAmount === "number"
        ? detail("Total", nf(currency).format(totalAmount))
        : "";

    const body = `
    <p style="margin:0 0 10px;">Hi ${fullName || "there"
      }, your ticket status changed.</p>
    ${infoCard(
        "Update",
        `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${detail("Event", eventTitle)}
        ${detail("Ticket", ticketTypeName)}
        ${detail("Status", pretty)}
        ${extra}
        ${totalRow}
      </table>
    `
      )}
  `;

    await this.sendEmail({
      to: email,
      subject: `Ticket ${status.toLowerCase()} — ${eventTitle}`,
      html: layout({
        title: "Ticket status updated",
        preheader: `Your ticket is now ${status}`,
        bodyHtml: body,
        cta: { label: "Open tickets", href: `${FRONTEND_URL}/tickets` },
      }),
    });
  }

  async sendDepositReceived(
    email: string,
    fullName: string,
    amount: number,
    depositId: string
  ): Promise<void> {
    const body = `
    <p style="margin:0 0 10px;">Hi ${fullName || "there"
      }, we’ve received your deposit request.</p>
    ${infoCard(
        "Deposit details",
        `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${detail("Amount", nf().format(amount))}
        ${detail("Reference", depositId)}
        ${detail("Status", "Received ⏳")}
      </table>
    `
      )}
    <p style="margin:10px 0 0;color:#475569;">We’ll notify you as it moves through review.</p>
  `;

    await this.sendEmail({
      to: email,
      subject: `Deposit received — ${APP}`,
      html: layout({
        title: "Deposit received",
        preheader: `We received your deposit ${depositId}`,
        bodyHtml: body,
        cta: {
          label: "View transaction",
          href: `${FRONTEND_URL}/wallet/transactions/${encodeURIComponent(
            depositId
          )}`,
        },
      }),
    });
  }

  async sendDepositQueuedForReview(
    email: string,
    fullName: string,
    amount: number,
    depositId: string
  ): Promise<void> {
    const body = `
    <p style="margin:0 0 10px;">Hi ${fullName || "there"
      }, your deposit is queued for manual review.</p>
    ${infoCard(
        "Deposit details",
        `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${detail("Amount", nf().format(amount))}
        ${detail("Reference", depositId)}
        ${detail("Status", "Queued for review 🔎")}
      </table>
    `
      )}
    <p style="margin:10px 0 0;color:#475569;">We’ll update you once the review is complete.</p>
  `;

    await this.sendEmail({
      to: email,
      subject: `Deposit queued for review — ${APP}`,
      html: layout({
        title: "Queued for review",
        preheader: `Deposit ${depositId} is awaiting review`,
        bodyHtml: body,
        cta: {
          label: "Track status",
          href: `${FRONTEND_URL}/wallet/transactions/${encodeURIComponent(
            depositId
          )}`,
        },
      }),
    });
  }

  async sendDepositApproved(
    email: string,
    fullName: string,
    amount: number,
    depositId: string
  ): Promise<void> {
    const body = `
    <p style="margin:0 0 10px;">Hi ${fullName || "there"
      }, your deposit has been approved.</p>
    ${infoCard(
        "Deposit details",
        `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${detail("Amount", nf().format(amount))}
        ${detail("Reference", depositId)}
        ${detail("Status", "Approved ✅")}
      </table>
    `
      )}
    <p style="margin:10px 0 0;color:#475569;">Funds have been added to your balance.</p>
  `;

    await this.sendEmail({
      to: email,
      subject: `Deposit approved — ${APP}`,
      html: layout({
        title: "Deposit approved",
        preheader: `Deposit ${depositId} was approved`,
        bodyHtml: body,
        cta: { label: "View wallet", href: `${FRONTEND_URL}/wallet` },
      }),
    });
  }

  async sendDepositFailed(
    email: string,
    fullName: string,
    amount: number,
    depositId: string,
    reason: string
  ): Promise<void> {
    const body = `
    <p style="margin:0 0 10px;">Hi ${fullName || "there"
      }, unfortunately your deposit could not be completed.</p>
    ${infoCard(
        "Deposit details",
        `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${detail("Amount", nf().format(amount))}
        ${detail("Reference", depositId)}
        ${detail("Status", "Failed ❌")}
        ${detail("Reason", reason)}
      </table>
    `
      )}
    <p style="margin:10px 0 0;color:#475569;">You can try again, or visit our support page if you need help.</p>
  `;

    await this.sendEmail({
      to: email,
      subject: `Deposit failed — ${APP}`,
      html: layout({
        title: "Deposit failed",
        preheader: `Deposit ${depositId} failed`,
        bodyHtml: body,
        cta: {
          label: "Try again",
          href: `${FRONTEND_URL}/wallet/deposit`,
        },
      }),
    });
  }

  /* ------------------------------ Support Emails ------------------------------- */

  async sendSupportTicketReceived(params: {
    email: string;
    fullName: string;
    subject: string;
    message: string;
    ticketId: string; // kept for signature compatibility, not displayed
  }): Promise<void> {
    const { email, fullName, subject, message } = params;

    const body = `
      <p style="margin:0 0 10px;">Hi ${fullName || "there"},</p>
      <p style="margin:0 0 10px;">
        We've received your support message. Our team will review it and get back to you as soon as possible.
      </p>
      ${infoCard(
      "Message summary",
      `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          ${detail("Subject", subject)}
        </table>
      `
    )}
      ${infoCard(
      "Your message",
      `
        <p style="margin:0;white-space:pre-line;color:#0f172a;">${message}</p>
      `
    )}
      <p style="margin:12px 0 0;color:#475569;font-size:13px;">
        You can follow up or add more details anytime from your support page.
      </p>
    `;

    await this.sendEmail({
      to: email,
      subject: `We received your support message — ${APP}`,
      html: layout({
        title: "Support message received",
        preheader: "We’ve received your support message",
        bodyHtml: body,
        cta: { label: "Visit website", href: FRONTEND_URL },
      }),
    });
  }

  async sendSupportTicketReply(params: {
    email: string;
    fullName: string;
    subject: string;
    ticketId: string; // kept for signature compatibility, not displayed
    replyBody: string;
  }): Promise<void> {
    const { email, fullName, subject, replyBody } = params;

    const body = `
      <p style="margin:0 0 10px;">Hi ${fullName || "there"},</p>
      <p style="margin:0 0 10px;">
        Our team has replied to your support message.
      </p>
      ${infoCard(
      "Conversation",
      `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          ${detail("Subject", subject)}
        </table>
      `
    )}
      ${infoCard(
      "Our reply",
      `
        <p style="margin:0;white-space:pre-line;color:#0f172a;">${replyBody}</p>
      `
    )}
      <p style="margin:12px 0 0;color:#475569;font-size:13px;">
        If you still need help, you can view and continue this conversation from your support page.
      </p>
    `;

    await this.sendEmail({
      to: email,
      subject: `Update on your support message — ${APP}`,
      html: layout({
        title: "We’ve replied to your message",
        preheader: "There’s a new message from our team",
        bodyHtml: body,
        cta: { label: "Visit website", href: FRONTEND_URL },
      }),
    });
  }

  async sendSupportTicketNotificationToAdmin(params: {
    subject: string;
    fromEmail: string;
    fromName: string;
    message: string;
    ticketId: string; // kept for signature compatibility, not displayed to user
  }): Promise<void> {
    const { subject, fromEmail, fromName, message } = params;
    if (!NOTIFY_EMAILS.length) return;

    const body = `
      <p style="margin:0 0 8px;">A new support message was created.</p>
      ${infoCard(
      "Message details",
      `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          ${detail("Subject", subject)}
          ${detail("From", `${fromName} &lt;${fromEmail}&gt;`)}
        </table>
      `
    )}
      ${infoCard(
      "Message",
      `
        <p style="margin:0;white-space:pre-line;color:#0f172a;">${message}</p>
      `
    )}
    `;

    await this.sendEmail({
      to: NOTIFY_EMAILS,
      subject: `New support message — ${subject}`,
      html: layout({
        title: "New support message",
        preheader: `New support message from ${fromEmail}`,
        bodyHtml: body,
        cta: {
          label: "View in admin",
          href: `${FRONTEND_URL}/admin/support`,
        },
      }),
    });
  }
}

export default EmailServiceImpl;