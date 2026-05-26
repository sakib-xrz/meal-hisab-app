import { getAccessToken, getMessId } from "@/lib/auth/session";
import { getApiBaseUrl } from "@/lib/api/config";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  tenant?: boolean;
  token?: string | null;
  messId?: string | null;
};

type FormDataRequestOptions = {
  method?: string;
  formData: FormData;
  tenant?: boolean;
  token?: string | null;
  messId?: string | null;
};

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

function formatApiErrorMessage(json: {
  message?: string;
  error?: { message?: string; code?: string };
  errors?: string[];
} | null): string {
  if (json?.message) {
    if (json.errors?.length) {
      const detail = json.errors[0];
      if (detail && !json.message.includes(detail.slice(0, 40))) {
        return `${json.message}: ${detail.split("\n")[0]}`;
      }
    }
    return json.message;
  }

  return json?.error?.message ?? "Request failed";
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    tenant = false,
    token: tokenOverride,
    messId: messIdOverride,
  } = options;

  const apiBase = getApiBaseUrl();
  const token = tokenOverride ?? (await getAccessToken());
  const messId = messIdOverride ?? (await getMessId());

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (tenant) {
    if (!messId) {
      throw new ApiError("No mess selected", 400, "NO_MESS");
    }
    headers["X-MessID"] = messId;
  }

  let response: Response;

  try {
    response = await fetch(`${apiBase}/api/v1${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      `Cannot reach the server at ${apiBase}. Make sure the backend is running and your phone is on the same network.`,
      0,
      "NETWORK_ERROR",
    );
  }

  let json: {
    success?: boolean;
    data?: T;
    message?: string;
    error?: { message?: string; code?: string };
    errors?: string[];
  } | null = null;

  try {
    json = await response.json();
  } catch {
    // non-JSON response
  }

  if (!response.ok) {
    if (response.status === 401 && onUnauthorized) {
      onUnauthorized();
    }

    throw new ApiError(
      formatApiErrorMessage(json),
      response.status,
      json?.error?.code,
    );
  }

  if (json && "data" in json) {
    return json.data as T;
  }

  return json as T;
}

export async function apiFormDataRequest<T>(
  path: string,
  options: FormDataRequestOptions,
): Promise<T> {
  const {
    method = "POST",
    formData,
    tenant = false,
    token: tokenOverride,
    messId: messIdOverride,
  } = options;

  const apiBase = getApiBaseUrl();
  const token = tokenOverride ?? (await getAccessToken());
  const messId = messIdOverride ?? (await getMessId());

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (tenant) {
    if (!messId) {
      throw new ApiError("No mess selected", 400, "NO_MESS");
    }
    headers["X-MessID"] = messId;
  }

  let response: Response;

  try {
    response = await fetch(`${apiBase}/api/v1${path}`, {
      method,
      headers,
      body: formData,
    });
  } catch {
    throw new ApiError(
      `Cannot reach the server at ${apiBase}. Make sure the backend is running and your phone is on the same network.`,
      0,
      "NETWORK_ERROR",
    );
  }

  let json: {
    success?: boolean;
    data?: T;
    message?: string;
    error?: { message?: string; code?: string };
    errors?: string[];
  } | null = null;

  try {
    json = await response.json();
  } catch {
    // non-JSON response
  }

  if (!response.ok) {
    if (response.status === 401 && onUnauthorized) {
      onUnauthorized();
    }

    throw new ApiError(
      formatApiErrorMessage(json),
      response.status,
      json?.error?.code,
    );
  }

  if (json && "data" in json) {
    return json.data as T;
  }

  return json as T;
}
