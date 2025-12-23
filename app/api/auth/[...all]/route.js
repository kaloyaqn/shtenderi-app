import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { getCorsHeaders } from "@/lib/cors";

const handler = toNextJsHandler(auth);

async function normalizeRequest(req) {
  if (req.method !== "POST") return req;

  const contentType = req.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  if (isJson) return req;

  // Accept form-data or urlencoded bodies from mobile clients and convert to JSON
  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const form = await req.formData();
    const bodyObj = Object.fromEntries(form.entries());
    const headers = new Headers(req.headers);
    headers.set("content-type", "application/json");
    return new Request(req.url, {
      method: req.method,
      headers,
      body: JSON.stringify(bodyObj),
      redirect: "manual",
    });
  }

  return req;
}

const withCors = (fn) => {
  return async (req, ctx) => {
    const normalizedReq = await normalizeRequest(req);
    const res = await fn(normalizedReq, ctx);
    const headers = getCorsHeaders(req);
    Object.entries(headers).forEach(([key, value]) => {
      if (value) res.headers.set(key, value);
    });
    return res;
  };
};

export const GET = withCors(handler.GET);
export const POST = withCors(handler.POST);

export async function OPTIONS(req) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(req),
  });
}
