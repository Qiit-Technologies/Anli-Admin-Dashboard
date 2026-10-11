import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "https://be.weareanli.com";

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

async function proxy(req: NextRequest, context: RouteContext) {
  // Strip origin/referer/cookie headers that trigger the backend's CORS 500.
  // The proxy is server-to-server, so no CORS is needed.
  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const auth = req.headers.get("authorization");
  if (auth) headers.set("authorization", auth);

  const url = new URL(req.url);
  // Build the backend path from the catch-all route segments. These are
  // always basePath-relative, which makes this robust regardless of whether
  // Next.js includes the basePath ('/superadmin') in request.url — a regex
  // on url.pathname silently failed to strip it in production, forwarding
  // '/be-api/...' to the backend and causing 404s on every client-side call
  // (login, document downloads).
  const segments = ((await context.params).path ?? []).filter(
    (s) => s && s !== "." && s !== "..",
  );
  const target = `${BACKEND_URL}/${segments.join("/")}${url.search}`;

  const body = ["GET", "HEAD"].includes(req.method)
    ? undefined
    : await req.arrayBuffer();

  const upstream = await fetch(target, {
    method: req.method,
    headers,
    body,
    // @ts-ignore - duplex needed for streaming bodies in Node 18+
    duplex: "half",
  });

  const respHeaders = new Headers();
  const respContentType = upstream.headers.get("content-type");
  if (respContentType) respHeaders.set("content-type", respContentType);

  return new NextResponse(await upstream.arrayBuffer(), {
    status: upstream.status,
    headers: respHeaders,
  });
}

export async function GET(req: NextRequest, context: RouteContext) {
  return proxy(req, context);
}
export async function POST(req: NextRequest, context: RouteContext) {
  return proxy(req, context);
}
export async function PUT(req: NextRequest, context: RouteContext) {
  return proxy(req, context);
}
export async function PATCH(req: NextRequest, context: RouteContext) {
  return proxy(req, context);
}
export async function DELETE(req: NextRequest, context: RouteContext) {
  return proxy(req, context);
}
