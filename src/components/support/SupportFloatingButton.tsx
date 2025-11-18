"use client";

import Link from "next/link";
import React from "react";

export const SupportFloatingButton: React.FC = () => {
    return (
        <Link
            href="/support"
            aria-label="Go to support"
            title="Need help? Contact support"
            className="support-floating-button"
        >
            <span className="support-floating-button__icon" aria-hidden="true">
                {/* Simple message/chat bubble icon (no external libs needed) */}
                <svg
                    viewBox="0 0 24 24"
                    className="support-floating-button__svg"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M4 4h16a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H13l-3.6 3.2a1 1 0 0 1-1.7-.7V16H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
                </svg>
            </span>
            <span className="support-floating-button__label">Support</span>
        </Link>
    );
};
