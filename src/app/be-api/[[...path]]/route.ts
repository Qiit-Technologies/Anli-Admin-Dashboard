import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "https://be.weareanli.com";

async function proxy(req: NextRequest) {
  // Strip origin/referer/cookie headers that trigger the backend's CORS 500.
  // The proxy is server-to-server, so no CORS is needed.
  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const auth = req.headers.get("authorization");
  if (auth) headers.set("authorization", auth);

  const url = new URL(req.url);
  // /be-api/<path> -> BACKEND_URL/<path>, preserving query string
  const target = `${BACKEND_URL}${url.pathname.replace(/^\/be-api/, "")}${url.search}`;

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

export async function GET(req: NextRequest) { return proxy(req); }
export async function POST(req: NextRequest) { return proxy(req); }
export async function PUT(req: NextRequest) { return proxy(req); }
export async function PATCH(req: NextRequest) { return proxy(req); }
export async function DELETE(req: NextRequest) { return proxy(req); }
