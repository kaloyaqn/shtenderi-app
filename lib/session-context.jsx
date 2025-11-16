"use client";

import { createContext, useContext } from "react";
import { authClient } from "./auth-client";

const SessionContext = createContext(null);

export function SessionProvider({ session, children }) {
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const session = useContext(SessionContext);
  return {
    data: session,
    status: session ? "authenticated" : "unauthenticated",
  };
}

export async function signOut() {
  await authClient.signOut();
  window.location.href = '/login';
}

