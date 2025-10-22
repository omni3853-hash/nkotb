import { MembershipStatus } from "@/lib/enums/membership.enums";

function isMembershipStatus(v: any): v is MembershipStatus {
    return Object.values(MembershipStatus).includes(v as MembershipStatus);
}

/**
 * Optional default status via env (e.g., ACTIVE / PENDING / EXPIRED / SUSPENDED / CANCELED).
 * If invalid or unset, we fall back to undefined (i.e., show all when not provided).
 */
const raw = process.env.NEXT_PUBLIC_DEFAULT_MEMBERSHIP_STATUS;
export const DEFAULT_MEMBERSHIP_STATUS: MembershipStatus | undefined =
    raw && isMembershipStatus(raw) ? (raw as MembershipStatus) : undefined;

export { isMembershipStatus };
