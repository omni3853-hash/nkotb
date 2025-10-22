// /lib/config/env.ts
export const env = {
    MONGODB_URI: process.env.MONGODB_URI!,
    JWT_KEY: process.env.JWT_KEY!,
    JWT_EXPIRES: process.env.JWT_EXPIRES || '3d',
    EMAIL: {
        HOST: process.env.EMAIL_HOST!,
        PORT: Number(process.env.EMAIL_PORT || 465),
        USER: process.env.EMAIL_USER!,
        PASS: process.env.EMAIL_PASS!,
    },
    BRAND: {
        LOGO_URL: process.env.LOGO_URL || '',
        APP_NAME: process.env.APP_NAME || 'Celebrity Booking',
        CONTACT: process.env.CONTACT_INFO || 'support@celebook.com',
        COLOR: process.env.MAJOR_COLOR || '#6D28D9',
    },
    OTP_TTL_SECONDS: Number(process.env.OTP_TTL_SECONDS || 600),
};
