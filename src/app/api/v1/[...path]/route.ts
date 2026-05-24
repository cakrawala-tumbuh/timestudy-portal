/**
 * Server-side proxy for all `/api/v1/*` requests.
 *
 * Forwards every request to the backend using the `BACKEND_URL` environment
 * variable, which is resolved at **runtime** inside the Docker container
 * (`http://backend:8000`). This avoids baking the backend URL into the
 * client-side bundle at build time.
 *
 * @module api-proxy
 */

import { getToken } from "next-auth/jwt";
import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

async function proxy(
  req: NextRequest,
  { params }: { params: { path: string[] } }
): Promise<NextResponse> {
  const path = params.path.join("/");
  const search = req.nextUrl.search;
  const target = `${BACKEND_URL}/api/v1/${path}${search}`;

  const headers = new Headers(req.headers);
  headers.delete("host");

  // Inject Authorization header directly from the NextAuth JWT cookie.
  // This is more reliable than relying on middleware header propagation.
  const token = await getToken({ req });
  console.log(`[proxy] ${req.method} ${target} | token=${token ? "ok" : "null"} | accessToken=${token?.accessToken ? "ok" : "missing"} | Authorization=${headers.has("Authorization") ? "present" : "absent"}`);
  if (token?.accessToken) {
    headers.set("Authorization", `Bearer ${token.accessToken as string}`);
  }

  const init: RequestInit & { duplex?: string } = { method: req.method, headers };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req.body;
    init.duplex = "half";
  }

  try {
    const upstream = await fetch(target, init);
    const resHeaders = new Headers(upstream.headers);
    resHeaders.delete("transfer-encoding");

    return new NextResponse(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: resHeaders,
    });
  } catch (err) {
    console.error("[api-proxy] backend unreachable:", target, err);
    return NextResponse.json({ detail: "Backend unreachable" }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
