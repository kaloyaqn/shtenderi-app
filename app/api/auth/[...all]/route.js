import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { getCorsHeaders } from "@/lib/cors";

const handler = toNextJsHandler(auth);

const withCors = (fn) => {
  return async (req, ctx) => {
    const res = await fn(req, ctx);
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
