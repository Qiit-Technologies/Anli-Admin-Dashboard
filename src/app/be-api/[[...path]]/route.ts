import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

async function proxy(req: NextRequest, context: RouteContext) {
  const backendUrl = new URL(
    process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://localhost:3000",
  );
  const segments = (await context.params).path ?? [];

  if (segments.some((segment) => segment === "." || segment === "..")) {
    return NextResponse.json({ message: "Invalid API path." }, { status: 400 });
  }

  const backendPath = segments.map(encodeURIComponent).join("/");
  const basePath = backendUrl.pathname.replace(/\/+$/, "");
  backendUrl.pathname = `${basePath}/${backendPath}`;
  backendUrl.search = req.nextUrl.search;
  backendUrl.hash = "";

  const headers = new Headers();
  for (const name of ["accept", "content-type", "authorization"]) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }

  const body = ["GET", "HEAD"].includes(req.method)
    ? undefined
    : await req.arrayBuffer();

  const upstream = await fetch(backendUrl, {
    method: req.method,
    headers,
    body,
  });

  const responseHeaders = new Headers();
  for (const name of ["content-type", "content-disposition"]) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }

  return new NextResponse(await upstream.arrayBuffer(), {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export async function GET(req: NextRequest, context: RouteContext) {
  return proxy(req, context);
}

export async function HEAD(req: NextRequest, context: RouteContext) {
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
