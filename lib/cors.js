const DEFAULT_ALLOWED_ORIGINS = ["http://localhost:8081"];

export function getCorsHeaders(req) {
  const origin = req.headers.get("origin");
  const envOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  const allowedOrigins = [...new Set([...envOrigins, ...DEFAULT_ALLOWED_ORIGINS])];

  const headers = {
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (origin && allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}
