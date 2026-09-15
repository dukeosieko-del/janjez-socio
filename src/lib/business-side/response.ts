import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import type { BusinessApiFailure } from "./types";

export function businessSuccess<T>(data: T, status = 200, extras: Record<string, unknown> = {}) {
  return NextResponse.json(
    {
      ...extras,
      success: true,
      data,
      error: null,
      request_id: randomUUID(),
      timestamp: new Date().toISOString(),
    },
    { status },
  );
}

export function businessError(code: string, message: string, status: number) {
  const body: BusinessApiFailure = {
    success: false,
    data: null,
    error: {
      code,
      message,
    },
    request_id: randomUUID(),
    timestamp: new Date().toISOString(),
  };
  return NextResponse.json(body, { status });
}

export function parseJson(rawBody: string): unknown {
  if (!rawBody) return null;
  return JSON.parse(rawBody) as unknown;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
