export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3001";

type ErrorPayload = {
  error?: string;
};

export async function getErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as ErrorPayload;
    if (payload.error && payload.error.trim()) return payload.error;
  } catch {
    // Ignore JSON parsing errors and fall through to status text.
  }

  return response.statusText || `Request failed with status ${response.status}`;
}

function pickStringField(obj: Record<string, unknown>, key: string): string | null {
  const value = obj[key];
  return typeof value === "string" && value.trim() ? value : null;
}

/** Converts unknown thrown values into a readable error message. */
export function normalizeErrorMessage(error: unknown): string {
  if (typeof error === "string" && error.trim()) return error;

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const record = error as Record<string, unknown>;

    const directFields = ["shortMessage", "message", "details", "reason", "error"];
    for (const field of directFields) {
      const msg = pickStringField(record, field);
      if (msg) return msg;
    }

    const cause = record["cause"];
    if (typeof cause === "object" && cause !== null) {
      const causeRecord = cause as Record<string, unknown>;
      for (const field of directFields) {
        const msg = pickStringField(causeRecord, field);
        if (msg) return msg;
      }
    }

    try {
      return JSON.stringify(error);
    } catch {
      // fall through
    }
  }

  return "Unexpected error";
}
