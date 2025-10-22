import { AxiosError } from "axios";

export function getApiErrorMessage(e: unknown, fallback = "Something went wrong") {
    const ax = e as AxiosError<any>;
    return (
        (ax?.response?.data && (ax.response.data.message || ax.response.data.error)) ||
        (ax?.response && (ax.response as any).message) ||
        (ax?.message) ||
        fallback
    );
}

export class CustomError extends Error {
    statusCode: number;
    details?: unknown;
    constructor(message: string, statusCode = 400, details?: unknown) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
    }
}