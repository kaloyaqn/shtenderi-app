"use client";

import { SessionProvider } from "@/lib/session-context";

// Provide session to client components via context
export default function SessionLayout({ session, children }) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
} 